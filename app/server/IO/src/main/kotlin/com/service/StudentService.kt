package com.service

import com.repository.StudentRepository
import com.database.table.ApplicationStatus
import com.routers.ApplyTopicRequest
import com.routers.ThesisTopicResponse
import com.routers.ApplicationsResponse
import com.routers.PromoterInfo
import com.routers.StudentInfo
import org.jetbrains.exposed.sql.alias

class StudentService(private val repo: StudentRepository) {

    fun getTopics(): List<ThesisTopicResponse> =
        repo.getAllTopics().map {
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

    fun searchTopics(query: String, degreeFilter: String?): List<ThesisTopicResponse> {
        val results = repo.searchTopics(query, degreeFilter)
        if (results.isNotEmpty()) {
            return results.map {
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
        } else {
            // fallback: all topics
            return getTopics()
        }
    }

    fun getStudentApplications(studentId: Int): List<ApplicationsResponse> {
        val studentUser = com.database.table.Users.alias("student_user")
        return repo.getStudentApplications(studentId).map {
            ApplicationsResponse(
                id = it[com.database.table.Applications.id].value,
                topicId = it[com.database.table.ThesesTopics.id].value,
                topicTitle = it[com.database.table.ThesesTopics.title],
                description = it[com.database.table.Applications.description],
                status = it[com.database.table.Applications.status],
                student = StudentInfo(
                    id = it[studentUser[com.database.table.Users.id]].value,
                    name = it[studentUser[com.database.table.Users.name]],
                    surname = it[studentUser[com.database.table.Users.surname]],
                ),
                promoter = PromoterInfo(
                    id = it[com.database.table.Users.id].value,
                    name = it[com.database.table.Users.name],
                    surname = it[com.database.table.Users.surname],
                    expertiseField = it[com.database.table.Supervisors.expertiseField]
                )
            )
        }
    }
    sealed class ApplyResult {
        object StudentNotFound : ApplyResult()
        object AlreadyConfirmed : ApplyResult()
        object AlreadyApplied : ApplyResult()
        object NoSlots : ApplyResult()
        object TopicNotFound : ApplyResult()
        data class Success(
            val promoterEmail: String,
            val topicTitle: String,
            val confirmationToken: String
        ) : ApplyResult()
    }

    fun applyForTopic(
        userId: Int,
        req: ApplyTopicRequest,
        confirmationToken: String
    ): ApplyResult {
        val student = repo.getStudentIdAndEmail(userId) ?: return ApplyResult.StudentNotFound
        val (studentId, studentEmail) = student

        if (repo.studentHasConfirmedApplication(studentId)) return ApplyResult.AlreadyConfirmed

        val topic = repo.getTopicData(req.topicId) ?: return ApplyResult.TopicNotFound
        if (topic.availableSlots <= 0) return ApplyResult.NoSlots
        if (repo.studentAlreadyApplied(studentId, req.topicId)) return ApplyResult.AlreadyApplied

        repo.insertApplication(
            studentId = studentId,
            promoterId = topic.promoterId,
            topicId = req.topicId,
            description = req.description,
            status = ApplicationStatus.PENDING.code,
            confirmationToken = confirmationToken
        )

        return ApplyResult.Success(
            promoterEmail = topic.promoterEmail,
            topicTitle = topic.topicTitle,
            confirmationToken = confirmationToken
        )
    }

    fun withdrawApplication(applicationId: Int){
        repo.withdrawApplication(applicationId)
    }
}
