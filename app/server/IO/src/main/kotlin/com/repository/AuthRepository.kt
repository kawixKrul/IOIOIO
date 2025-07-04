package com.repository

import com.database.table.Users
import com.database.table.Sessions
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import java.time.LocalDateTime

class AuthRepository {
    fun findActiveUserByEmail(email: String): ResultRow? = transaction {
        Users.select { (Users.email eq email) and (Users.isActive eq true) }
            .singleOrNull()
    }
    fun findUserProfile(userId: Int): Map<String, Any?> = transaction {
        Users.select { Users.id eq userId }
            .single()
            .let { row ->
                mapOf(
                    "id" to row[Users.id].value,
                    "email" to row[Users.email],
                    "name" to row[Users.name],
                    "surname" to row[Users.surname],
                    "role" to row[Users.role],
                    "isActive" to row[Users.isActive]
                )
            }
    }

    fun createSession(
        userId: Int,
        sessionToken: String,
        createdAt: LocalDateTime,
        expiresAt: LocalDateTime,
        userAgent: String?,
        ipAddress: String?
    ) = transaction {
        Sessions.insert {
            it[this.userId] = userId
            it[this.token] = sessionToken
            it[this.createdAt] = createdAt
            it[this.expiresAt] = expiresAt
            it[this.userAgent] = userAgent
            it[this.ipAddress] = ipAddress
        }
    }
}
