package com.routers

// RegistrationRoutes.kt
import com.database.table.Users
import com.repository.AuthRepository
import com.service.AuthService
import com.utils.currentUserId
import io.ktor.http.*
import io.ktor.server.plugins.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.util.date.GMTDate
import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction


@Serializable
data class LoginRequest(
    val email: String,
    val password: String
)

@Serializable
data class VerifyResponse(
    val authenticated: Boolean,
    val userId: Int?
)

@Serializable
data class ProfileResponse(
    val id: Int,
    val email: String,
    val name: String,
    val surname: String,
    val role: String,
    val isActive: Boolean,
    val createdAt: String? = null  // Optional field
)

val authRepository = AuthRepository()
val authService = AuthService(authRepository)

fun Route.loginRoutes(authService: AuthService) {
    post("/login") {
        val req = call.receive<LoginRequest>()
        val email = req.email.trim().lowercase()
        val password = req.password

        val userAgent = call.request.headers["User-Agent"]
        val ipAddress = call.request.origin.remoteHost

        val result = authService.login(email, password, userAgent, ipAddress)

        result.fold(
            onSuccess = {
                call.response.cookies.append(
                    Cookie(
                        name = "session_token",
                        value = it.sessionToken,
                        httpOnly = true,
                        secure = false,
                        path = "/",
                        maxAge = 60 * 60
                    )
                )
                call.respond(HttpStatusCode.OK, "Login successful. Session cookie set.")
            },
            onFailure = { e ->
                call.respond(HttpStatusCode.Unauthorized, e.message ?: "Login failed")
            }
        )
    }

    get("/auth/verify") {
        try {
            val userId = call.currentUserId()
            val authenticated = userId != null && transaction {
                Users.select { Users.id eq userId }.count() > 0
            }

            call.respond(VerifyResponse(
                authenticated = authenticated,
                userId = userId
            ))

        } catch (e: Exception) {
            call.respond(HttpStatusCode.InternalServerError, mapOf(
                "error" to "Verification failed"
            ))
        }
    }

    get("/auth/profile") {
        val userId = call.currentUserId() ?: run {
            call.respond(HttpStatusCode.Unauthorized, "Not authenticated")
            return@get
        }

        try {
            val user = transaction {
                Users.select { Users.id eq userId }.singleOrNull()
            } ?: throw NoSuchElementException("User not found")

            call.respond(ProfileResponse(
                id = user[Users.id].value,
                email = user[Users.email],
                name = user[Users.name],
                surname = user[Users.surname],
                role = user[Users.role],
                isActive = user[Users.isActive],
                createdAt = user[Users.createdAt]?.toString()
            ))

        } catch (e: NoSuchElementException) {
            call.respond(HttpStatusCode.NotFound, "User profile not found")
        } catch (e: Exception) {
            call.respond(HttpStatusCode.InternalServerError, mapOf(
                "error" to "Profile loading failed",
            ))
        }
    }

    post("/logout") {
        call.response.cookies.append(
            name = "session_token",
            value = "",
            encoding = CookieEncoding.URI_ENCODING,
            maxAge = 0,
            expires = GMTDate.START, // or GMTDate(0) - sets to epoch (past time)
            path = "/"
        )
        call.respond(HttpStatusCode.OK, "Logged out successfully")
    }

}
