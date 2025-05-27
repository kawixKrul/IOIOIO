package com.repository

import com.database.table.*
import org.jetbrains.exposed.dao.id.EntityID
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction
import java.time.LocalDateTime

class RegistrationRepository {
    fun userExists(email: String): Boolean = transaction {
        Users.select { Users.email eq email }.count() > 0
    }

    fun createUser(
        email: String,
        passwordHash: String,
        name: String,
        surname: String,
        role: String,
        now: LocalDateTime
    ): EntityID<Int> = transaction {
        Users.insert {
            it[this.email] = email
            it[this.passwordHash] = passwordHash
            it[this.isActive] = false
            it[this.createdAt] = now
            it[this.role] = role
            it[this.name] = name
            it[this.surname] = surname
        } get Users.id
    }

    fun createStudent(userId: EntityID<Int>) = transaction {
        Students.insert {
            it[this.userId] = userId
        }
    }

    fun createSupervisor(userId: EntityID<Int>, expertiseField: String) = transaction {
        Supervisors.insert {
            it[this.userId] = userId
            it[this.expertiseField] = expertiseField
        }
    }

    fun createActivationToken(userId: EntityID<Int>, token: String, expiresAt: LocalDateTime) = transaction {
        ActivationTokens.insert {
            it[ActivationTokens.userId] = userId
            it[ActivationTokens.token] = token
            it[ActivationTokens.expiresAt] = expiresAt
        }
    }

    fun getUserIdForValidToken(token: String, now: LocalDateTime): EntityID<Int>? = transaction {
        ActivationTokens
            .select { (ActivationTokens.token eq token) and (ActivationTokens.expiresAt greater now) }
            .singleOrNull()
            ?.get(ActivationTokens.userId)
    }

    fun activateUser(userId: EntityID<Int>) = transaction {
        Users.update({ Users.id eq userId }) { it[isActive] = true }
        ActivationTokens.deleteWhere { ActivationTokens.userId eq userId }
    }

    fun isUserActive(email: String): Boolean = transaction {
        Users.select { Users.email eq email }.singleOrNull()?.get(Users.isActive) ?: false
    }
}
