package com.routers

// RegistrationRoutes.kt
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


@Serializable
data class LoginRequest(
    val email: String,
    val password: String
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
        val userId = call.currentUserId()
        if (userId != null) {
            call.respond(HttpStatusCode.OK, mapOf("authenticated" to true, "userId" to userId))
        } else {
            call.respond(HttpStatusCode.Unauthorized, mapOf("authenticated" to false))
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
