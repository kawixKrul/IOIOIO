package com.routers

import com.database.table.Users
import com.utils.currentUserId
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.http.*
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction


import kotlinx.serialization.Serializable

@Serializable
data class UserProfileResponse(
    val id: Int,
    val email: String,
    val name: String,
    val surname: String,
    val role: String,
    val isActive: Boolean,
    val createdAt: String
)

fun Route.protectedRoutes() {
    get("/profile") {
        val userId = call.currentUserId()
        if (userId == null) {
            call.respond(HttpStatusCode.Unauthorized, "You are not logged in.")
            return@get
        }
        // Now you can use userId to fetch user info from the DB
        call.respond(HttpStatusCode.OK, "You are logged in as user ID: $userId")
    }

    get("/me") {
        val userId = call.currentUserId()
        if (userId == null) {
            call.respond(HttpStatusCode.Unauthorized, "Unauthorized")
            return@get
        }

        // Query user info
        val userData = transaction {
            Users.select { Users.id eq userId }
                .singleOrNull()
        }

        if (userData == null) {
            call.respond(HttpStatusCode.NotFound, "User not found")
            return@get
        }

        call.respond(
            UserProfileResponse(
                id = userData[Users.id].value,
                email = userData[Users.email],
                name = userData[Users.name],
                surname = userData[Users.surname],
                role = userData[Users.role],
                isActive = userData[Users.isActive],
                createdAt = userData[Users.createdAt].toString() // konwersja!
            )
        )
    }

}
