package com.service

import com.repository.RegistrationRepository
import com.hashPassword
import org.jetbrains.exposed.dao.id.EntityID
import java.time.LocalDateTime
import java.util.UUID

class RegistrationService(private val repo: RegistrationRepository) {

    data class RegistrationResult(val userId: EntityID<Int>, val token: String)

    fun registerUser(
        email: String,
        password: String,
        name: String,
        surname: String,
        role: String,
        expertiseField: String?,
        now: LocalDateTime
    ): Result<RegistrationResult> {
        if (repo.userExists(email)) {
            return Result.failure(IllegalArgumentException("User already exists"))
        }
        val isStudentEmail = email.contains("@student.agh.edu.pl")
        val isSupervisorEmail = !isStudentEmail

        if (!isStudentEmail && !isSupervisorEmail) {
            return Result.failure(IllegalArgumentException("Invalid email domain for registration"))
        }
        if (isSupervisorEmail && expertiseField.isNullOrBlank()) {
            return Result.failure(IllegalArgumentException("Expertise field is required for supervisors"))
        }

        val userId = repo.createUser(
            email,
            hashPassword(password),
            name,
            surname,
            if (isStudentEmail) "student" else "supervisor",
            now
        )
        if (isStudentEmail) {
            repo.createStudent(userId)
        } else {
            repo.createSupervisor(userId, expertiseField!!)
        }

        val token = UUID.randomUUID().toString()
        repo.createActivationToken(userId, token, now.plusDays(1))

        return Result.success(RegistrationResult(userId, token))
    }

    fun activateUser(token: String, now: LocalDateTime): Boolean {
        val userId = repo.getUserIdForValidToken(token, now) ?: return false
        repo.activateUser(userId)
        return true
    }

    fun isUserActive(email: String): Boolean = repo.isUserActive(email)
}
