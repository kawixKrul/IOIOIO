package com.routers

// RegistrationRoutes.kt
import com.repository.RegistrationRepository
import com.service.RegistrationService
import com.service.sendActivationEmail
import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.Serializable
import java.time.LocalDateTime

@Serializable
data class RegistrationRequest(
    val expertiseField: String? = null,
    val email: String,
    val password: String,
    val name: String,
    val surname: String,
    val role: String
)


fun Route.registrationRoutes(registrationService: RegistrationService, appBaseUrl: String, mailgunApiKey: String, mailgunDomain: String) {
    post("/register") {
        val req = call.receive<RegistrationRequest>()
        val email = req.email.trim().lowercase()
        val now = LocalDateTime.now()

        val result = registrationService.registerUser(
            email,
            req.password,
            req.name,
            req.surname,
            req.role,
            req.expertiseField,
            now
        )

        result.fold(
            onSuccess = {
                val activationLink = "$appBaseUrl/activate?token=${it.token}"
                sendActivationEmail(mailgunApiKey, mailgunDomain, email, activationLink)
                call.respond(HttpStatusCode.OK, "Registration successful. Check your email to activate your account.")
            },
            onFailure = { e ->
                call.respond(HttpStatusCode.BadRequest, e.message ?: "Registration error")
            }
        )
    }

    get("/activate") {
        val token = call.request.queryParameters["token"]
        if (token.isNullOrBlank()) {
            call.respond(HttpStatusCode.BadRequest, "Missing activation token")
            return@get
        }

        val now = LocalDateTime.now()
        val activated = registrationService.activateUser(token, now)
        if (activated) {
            call.respondText("Account activated successfully. You can now log in.")
        } else {
            call.respond(HttpStatusCode.BadRequest, "Invalid or expired token")
        }
    }

    get("/activation-status") {
        val email = call.request.queryParameters["email"]
        if (email.isNullOrBlank()) {
            call.respond(HttpStatusCode.BadRequest, "Email parameter is missing")
            return@get
        }
        val userIsActive = registrationService.isUserActive(email.trim().lowercase())
        call.respond(HttpStatusCode.OK, mapOf("isActive" to userIsActive))
    }
}
