package com.service

import com.repository.SupervisorRepository
import com.repository.SupervisorProfile
import com.routers.ApplicationsResponse
import com.routers.PromoterInfo
import com.routers.ThesisTopicRequest
import com.routers.ThesisTopicResponse

class SupervisorService(private val repo: SupervisorRepository) {

    fun getProfile(userId: Int): SupervisorProfile? =
        repo.getProfile(userId)

    fun addThesisTopic(userId: Int, req: ThesisTopicRequest): Boolean {
        val supervisorId = repo.getSupervisorIdByUserId(userId) ?: return false
        repo.addThesisTopic(supervisorId, req)
        return true
    }

    fun getSupervisorTopics(supervisorId : Int): List<ThesisTopicResponse> =
        repo.getThesisTopics(supervisorId).map {
            ThesisTopicResponse(
                id = it[com.database.table.ThesesTopics.id].value,
                title = it[com.database.table.ThesesTopics.title],
                description = it[com.database.table.ThesesTopics.description],
                degreeLevel = it[com.database.table.ThesesTopics.degreeLevel],
                availableSlots = it[com.database.table.ThesesTopics.availableSlots],
                tags = it[com.database.table.ThesesTopics.tagsList].split(",").map(String::trim),
                promoter = PromoterInfo(
                    id = it[com.database.table.Supervisors.id].value,
                    name = it[com.database.table.Users.name],
                    surname = it[com.database.table.Users.surname],
                    expertiseField = it[com.database.table.Supervisors.expertiseField]
                )
            )
        }

    fun getSupervisorApplications(supervisorId: Int): List<ApplicationsResponse> =
        repo.getSupervisorApplications(supervisorId).map {
            ApplicationsResponse(
                id = it[com.database.table.Applications.id].value,
                topicId = it[com.database.table.ThesesTopics.id].value,
                topicTitle = it[com.database.table.ThesesTopics.title],
                description = it[com.database.table.Applications.description],
                status = it[com.database.table.Applications.status],
                promoter = PromoterInfo(
                    id = it[com.database.table.Supervisors.id].value,
                    name = it[com.database.table.Users.name],
                    surname = it[com.database.table.Users.surname],
                    expertiseField = it[com.database.table.Supervisors.expertiseField]
                )
            )
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
