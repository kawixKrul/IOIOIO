package com.repository

import com.database.table.*
import com.routers.ThesisTopicRequest
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction

class SupervisorRepository {

    fun getProfile(userId: Int): SupervisorProfile? = transaction {
        (Users innerJoin Supervisors)
            .select { Users.id eq userId }
            .singleOrNull()
            ?.let {
                SupervisorProfile(
                    id = it[Users.id].value,
                    email = it[Users.email],
                    name = it[Users.name],
                    surname = it[Users.surname],
                    expertiseField = it[Supervisors.expertiseField]
                )
            }
    }

    fun getSupervisorIdByUserId(userId: Int): Int? = transaction {
        Supervisors.select { Supervisors.userId eq userId }
            .singleOrNull()?.get(Supervisors.id)?.value
    }

    fun addThesisTopic(
        supervisorId: Int,
        req: ThesisTopicRequest
    ) = transaction {
        ThesesTopics.insert {
            it[promoterId] = supervisorId
            it[title] = req.title
            it[description] = req.description
            it[degreeLevel] = req.degreeLevel
            it[availableSlots] = req.availableSlots
            it[tagsList] = req.tags.joinToString(",")
        }
    }

    data class ApplicationConfirmationData(
        val appId: Int,
        val studentId: Int,
        val topicId: Int,
        val currentSlots: Int,
        val topicTitle: String
    )

    fun getApplicationConfirmationData(token: String): ApplicationConfirmationData? = transaction {
        val app = Applications.innerJoin(ThesesTopics)
            .select { (Applications.confirmationToken eq token) and (Applications.status eq ApplicationStatus.PENDING.code) }
            .singleOrNull()
        if (app != null) {
            ApplicationConfirmationData(
                appId = app[Applications.id].value,
                studentId = app[Applications.studentId].value,
                topicId = app[Applications.topicId].value,
                currentSlots = app[ThesesTopics.availableSlots],
                topicTitle = app[ThesesTopics.title]
            )
        } else null
    }

    fun studentHasConfirmed(studentId: Int): Boolean = transaction {
        Applications.select {
            (Applications.studentId eq studentId) and
                    (Applications.status eq ApplicationStatus.CONFIRMED.code)
        }.count() > 0
    }

    fun confirmApplication(appId: Int) = transaction {
        Applications.update({ Applications.id eq appId }) {
            it[Applications.status] = ApplicationStatus.CONFIRMED.code
            it[Applications.confirmationToken] = null
        }
    }

    fun decreaseAvailableSlots(topicId: Int) = transaction {
        ThesesTopics.update({ ThesesTopics.id eq topicId }) {
            with(SqlExpressionBuilder) {
                it.update(ThesesTopics.availableSlots, ThesesTopics.availableSlots - 1)
            }
        }
    }

    fun rejectOtherPendingApplications(studentId: Int, confirmedAppId: Int) = transaction {
        Applications.update({
            (Applications.studentId eq studentId) and
                    (Applications.status eq ApplicationStatus.PENDING.code) and
                    (Applications.id neq confirmedAppId)
        }) {
            it[Applications.status] = ApplicationStatus.REJECTED.code
            it[Applications.confirmationToken] = null
        }
    }

    fun getStudentEmail(studentId: Int): String? = transaction {
        Students.innerJoin(Users)
            .select { Students.id eq studentId }
            .singleOrNull()?.get(Users.email)
    }
}

data class SupervisorProfile(
    val id: Int,
    val email: String,
    val name: String,
    val surname: String,
    val expertiseField: String?
)
