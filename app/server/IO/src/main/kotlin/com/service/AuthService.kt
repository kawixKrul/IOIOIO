package com.service

import com.repository.AuthRepository
import com.verifyPassword
import java.time.LocalDateTime
import java.util.*

class AuthService(private val repo: AuthRepository) {
    data class AuthResult(val sessionToken: String, val userId: Int)

    fun login(email: String, password: String, userAgent: String?, ipAddress: String?): Result<AuthResult> {
        val user = repo.findActiveUserByEmail(email)
            ?: return Result.failure(Exception("Invalid credentials or account not activated"))

        val storedHash = user[com.database.table.Users.passwordHash]
        if (!verifyPassword(password, storedHash)) {
            return Result.failure(Exception("Invalid credentials"))
        }

        val sessionToken = UUID.randomUUID().toString()
        val userId = user[com.database.table.Users.id].value
        val now = LocalDateTime.now()
        val expiresAt = now.plusDays(7)

        repo.createSession(userId, sessionToken, now, expiresAt, userAgent, ipAddress)

        return Result.success(AuthResult(sessionToken, userId))
    }
}
