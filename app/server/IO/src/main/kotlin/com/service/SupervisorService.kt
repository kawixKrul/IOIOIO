package com.service

import com.database.table.*
import com.repository.ApplicationRepository
import com.repository.SupervisorRepository
import com.repository.SupervisorProfile
import com.routers.ThesisTopicRequest
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction

class SupervisorService(private val repo: SupervisorRepository,
                        private val applicationService: ApplicationService) {

    fun getProfile(userId: Int): SupervisorProfile? =
        repo.getProfile(userId)

    fun addThesisTopic(userId: Int, req: ThesisTopicRequest): Boolean {
        val supervisorId = repo.getSupervisorIdByUserId(userId) ?: return false
        repo.addThesisTopic(supervisorId, req)
        return true
    }

    fun deleteThesisTopic(topicId: Int, supervisorId: Int): Boolean = transaction {
        // Check if the topic exists and belongs to the supervisor
        val topic = ThesesTopics.select {
            (ThesesTopics.id eq topicId) and (ThesesTopics.promoterId eq supervisorId)
        }.singleOrNull() ?: return@transaction false

        // Delete the topic
        ThesesTopics.deleteWhere { ThesesTopics.id eq topicId }
        return@transaction true
    }

    // Delegate application handling to ApplicationService
    fun answerApplication(
        applicationId: Int,
        newStatus: ApplicationStatus,
        supervisorId: Int
    ) = applicationService.answerApplication(
        applicationId = applicationId,
        newStatus = newStatus,
        supervisorId = supervisorId
    )

    fun confirmApplication(token: String): ApplicationService.ConfirmationResult {
        val data = repo.getApplicationConfirmationData(token) ?: return ApplicationService.ConfirmationResult.NotFound

        if (repo.studentHasConfirmed(data.studentId)) {
            return ApplicationService.ConfirmationResult.AlreadyConfirmed
        }
        if (data.currentSlots <= 0) {
            return ApplicationService.ConfirmationResult.NoSlots
        }

        // Confirm the application
        repo.confirmApplication(data.appId)
        // Decrease slots for topic
        repo.decreaseAvailableSlots(data.topicId)
        // Reject other pending applications from student
        repo.rejectOtherPendingApplications(data.studentId, data.appId)

        val studentEmail = repo.getStudentEmail(data.studentId) ?: return ApplicationService.ConfirmationResult.NotFound
        return ApplicationService.ConfirmationResult.Success(studentEmail, data.topicTitle)
    }
}
