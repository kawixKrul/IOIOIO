package com.utils

import com.database.table.Users
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationCall
import io.ktor.server.response.respond
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction

suspend fun ApplicationCall.requireAdmin(): Int? {
    val userId = currentUserId()
    if (userId == null) {
        respond(HttpStatusCode.Unauthorized, "You are not logged in.")
        return null
    }

    val isAdmin = transaction {
        Users.select { Users.id eq userId }
            .map { it[Users.role] }
            .singleOrNull() == "admin"
    }

    if (!isAdmin) {
        respond(HttpStatusCode.Forbidden, "Access denied. Admins only.")
        return null
    }

    return userId
}

suspend fun ApplicationCall.requireSupervisor(): Int? {
    val userId = currentUserId()
    if (userId == null) {
        respond(HttpStatusCode.Unauthorized, "You are not logged in.")
        return null
    }

    val isSupervisor = transaction {
        Users.select { Users.id eq userId }
            .map { it[Users.role] }
            .singleOrNull() == "supervisor"
    }

    if (!isSupervisor) {
        respond(HttpStatusCode.Forbidden, "Access denied. Supervisors only.")
        return null
    }

    return userId
}

