package com.routers

// RegistrationRoutes.kt

import com.database.table.Sessions
import com.database.table.Users
import com.hashPassword
import com.verifyPassword
import io.ktor.http.*
import io.ktor.server.plugins.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction
import java.time.LocalDateTime
import java.util.*


@Serializable
data class LoginRequest(
    val email: String,
    val password: String
)

fun Route.loginRoutes() {
    post("/login") {
        val req = call.receive<LoginRequest>()
        val email = req.email.trim().lowercase()
        val password = req.password

        // Check for active user
        val user = transaction {
            Users.select { (Users.email eq email) and (Users.isActive eq true) }
                .singleOrNull()
        }

        if (user == null) {
            call.respond(HttpStatusCode.Unauthorized, "Invalid credentials or account not activated")
            return@post
        }

        // Verify password
        val storedHash = user[Users.passwordHash]
        if (!verifyPassword(password, storedHash)) {
            call.respond(HttpStatusCode.Unauthorized, "Invalid credentials")
            return@post
        }

        // Gather extra info
        val userAgent = call.request.headers["User-Agent"]
        val ipAddress = call.request.origin.remoteHost

        // Generate and store session
        val sessionToken = UUID.randomUUID().toString()
        val userId = user[Users.id].value
        val now = LocalDateTime.now()
        val expiresAt = now.plusDays(7) // session valid for 7 days

        transaction {
            Sessions.insert {
                it[this.userId] = userId
                it[this.token] = sessionToken
                it[this.createdAt] = now
                it[this.expiresAt] = expiresAt
                it[this.userAgent] = userAgent
                it[this.ipAddress] = ipAddress
            }
        }


        // Set cookie
        call.response.cookies.append(
            Cookie(
                name = "session_token",
                value = sessionToken,
                httpOnly = true,
                secure = false, // set true in production!
                path = "/",
                maxAge = 60 * 60 // 1 hour
            )
        )

        call.respond(HttpStatusCode.OK, "Login successful. Session cookie set.")
    }




}
