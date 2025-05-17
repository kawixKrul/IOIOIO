package com.routers

// RegistrationRoutes.kt
import io.ktor.server.routing.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.http.*
import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.UUID
import java.time.LocalDateTime
import com.database.table.Users
import com.database.table.ActivationTokens
import com.database.table.Students
import com.hashPassword
import com.service.sendActivationEmail
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.update
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq


@Serializable
data class RegistrationRequest(
    val email: String,
    val password: String,
    val name: String,
    val surname: String,
    val role: String
)

fun Route.registrationRoutes(appBaseUrl: String, mailgunApiKey: String, mailgunDomain: String) {
    post("/register") {
        val req = call.receive<RegistrationRequest>()
        val email = req.email.trim().lowercase()

        // Check for existing user outside the transaction block
        val userExists = transaction {
            Users.select { Users.email eq email }.count() > 0
        }

        if (userExists) {
            call.respond(HttpStatusCode.BadRequest, "User already exists")
            return@post
        }

        // Now create the user and activation token in a single transaction
        val (userId, token) = transaction {
            // Create the user
            val now = LocalDateTime.now()
            val userId = Users.insert {
                it[this.email] = email
                it[this.passwordHash] = hashPassword(req.password)
                it[this.isActive] = false
                it[this.createdAt] = now
                it[this.role] = "student"
                it[this.name] = req.name
                it[this.surname] = req.surname
            } get Users.id

            // Add the student record
            Students.insert {
                it[this.userId] = userId
            }

            // Create activation token
            val token = UUID.randomUUID().toString()
            ActivationTokens.insert {
                it[ActivationTokens.userId] = userId
                it[ActivationTokens.token] = token
                it[ActivationTokens.expiresAt] = now.plusDays(1)
            }

            // Return both the user ID and the token
            userId.value to token
        }

        // Send the activation email (outside transaction for better performance)
        val activationLink = "$appBaseUrl/activate?token=$token"
        sendActivationEmail(mailgunApiKey, mailgunDomain, email, activationLink)

        call.respond(HttpStatusCode.OK, "Registration successful. Check your email to activate your account.")
    }



    get("/activate") {
        val token = call.request.queryParameters["token"]
        if (token.isNullOrBlank()) {
            call.respond(HttpStatusCode.BadRequest, "Missing activation token")
            return@get
        }

        val now = LocalDateTime.now()
        val userId = transaction {
            ActivationTokens
                .select { (ActivationTokens.token eq token) and (ActivationTokens.expiresAt greater now) }
                .singleOrNull()
                ?.get(ActivationTokens.userId)
        }

        if (userId == null) {
            call.respond(HttpStatusCode.BadRequest, "Invalid or expired token")
            return@get
        }

        transaction {
            Users.update({ Users.id eq userId }) { it[isActive] = true }
            ActivationTokens.deleteWhere { ActivationTokens.userId eq userId }
        }

        call.respondText("Account activated successfully. You can now log in.")
    }

}
