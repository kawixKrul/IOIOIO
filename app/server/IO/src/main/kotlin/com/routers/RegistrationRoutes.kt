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
import com.hashPassword
import com.service.sendActivationEmail
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.update
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq


@Serializable
data class RegistrationRequest(val email: String, val password: String)

fun Route.registrationRoutes(appBaseUrl: String, mailgunApiKey: String, mailgunDomain: String) {
    post("/register") {
        val req = call.receive<RegistrationRequest>()
        val email = req.email.trim().lowercase()

        // Check for existing user
        val existing = transaction { Users.select { Users.email eq email }.count() > 0 }
        if (existing) {
            call.respond(HttpStatusCode.BadRequest, "User already exists")
            return@post
        }

        val passwordHash = hashPassword(req.password)
        var userId = 0
        val now = LocalDateTime.now()
        transaction {
            userId = Users.insert {
                it[Users.email] = email
                it[Users.passwordHash] = passwordHash
                it[Users.isActive] = false
                it[Users.createdAt] = now
                it[Users.role] = "student"
            } get Users.id
        }

        val token = UUID.randomUUID().toString()
        val expiresAt = now.plusDays(1)
        transaction {
            ActivationTokens.insert {
                it[ActivationTokens.userId] = userId
                it[ActivationTokens.token] = token
                it[ActivationTokens.expiresAt] = expiresAt
            }
        }

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
