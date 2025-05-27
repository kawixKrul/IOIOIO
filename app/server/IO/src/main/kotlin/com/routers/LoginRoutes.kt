package com.routers

// RegistrationRoutes.kt
import com.repository.AuthRepository
import com.service.AuthService
import io.ktor.http.*
import io.ktor.server.plugins.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
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
                        secure = false, // true in production!
                        path = "/",
                        maxAge = 60 * 60 // 1 hour
                    )
                )
                call.respond(HttpStatusCode.OK, "Login successful. Session cookie set.")
            },
            onFailure = { e ->
                call.respond(HttpStatusCode.Unauthorized, e.message ?: "Login failed")
            }
        )
    }
}
