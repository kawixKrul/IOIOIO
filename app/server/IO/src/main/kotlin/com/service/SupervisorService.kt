package com.service

import com.repository.SupervisorRepository
import com.repository.SupervisorProfile
import com.routers.ThesisTopicRequest

class SupervisorService(private val repo: SupervisorRepository) {

    fun getProfile(userId: Int): SupervisorProfile? =
        repo.getProfile(userId)

    fun addThesisTopic(userId: Int, req: ThesisTopicRequest): Boolean {
        val supervisorId = repo.getSupervisorIdByUserId(userId) ?: return false
        repo.addThesisTopic(supervisorId, req)
        return true
    }

    sealed class ConfirmationResult {
        data class Success(val studentEmail: String, val topicTitle: String) : ConfirmationResult()
        data object AlreadyConfirmed : ConfirmationResult()
        data object NoSlots : ConfirmationResult()
        data object NotFound : ConfirmationResult()
    }

    fun confirmApplication(token: String): ConfirmationResult {
        val data = repo.getApplicationConfirmationData(token) ?: return ConfirmationResult.NotFound

        if (repo.studentHasConfirmed(data.studentId)) {
            return ConfirmationResult.AlreadyConfirmed
        }
        if (data.currentSlots <= 0) {
            return ConfirmationResult.NoSlots
        }

        // Confirm the application
        repo.confirmApplication(data.appId)
        // Decrease slots for topic
        repo.decreaseAvailableSlots(data.topicId)
        // Reject other pending applications from student
        repo.rejectOtherPendingApplications(data.studentId, data.appId)

        val studentEmail = repo.getStudentEmail(data.studentId) ?: return ConfirmationResult.NotFound
        return ConfirmationResult.Success(studentEmail, data.topicTitle)
    }
}
