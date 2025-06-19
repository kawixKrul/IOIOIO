package com.service

import com.database.table.*
import com.repository.ApplicationRepository
import org.jetbrains.exposed.sql.SqlExpressionBuilder
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.SqlExpressionBuilder.minus
import org.jetbrains.exposed.sql.SqlExpressionBuilder.neq
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update

class ApplicationService(
    private val applicationRepo: ApplicationRepository,
) {

    sealed class ConfirmationResult {
        data class Success(val studentEmail: String, val topicTitle: String) : ConfirmationResult()
        data object AlreadyConfirmed : ConfirmationResult()
        data object NoSlots : ConfirmationResult()
        data object NotFound : ConfirmationResult()
    }

    sealed class AnswerApplicationResult {
        data class Success(
            val studentEmail: String,
            val topicTitle: String,
            val newStatus: ApplicationStatus
        ) : AnswerApplicationResult()

        object NotFound : AnswerApplicationResult()
        object NoSlots : AnswerApplicationResult()
        object InvalidStatus : AnswerApplicationResult()
        object AlreadyProcessed : AnswerApplicationResult()
    }

    fun withdrawOtherApplications(studentId: Int, exceptApplicationId: Int) = transaction {
        Applications.update(
            where = {
                (Applications.studentId eq studentId) and
                        (Applications.id neq exceptApplicationId) and
                        (Applications.status eq ApplicationStatus.PENDING.code)
            },
            body = {
                it[status] = ApplicationStatus.WITHDRAWN.code
                it[confirmationToken] = null
            }
        )


    }

    fun answerApplication(
        applicationId: Int,
        newStatus: ApplicationStatus,
        supervisorId: Int
    ): AnswerApplicationResult = transaction {
        // 1. Validate the requested status transition
        if (newStatus != ApplicationStatus.CONFIRMED && newStatus != ApplicationStatus.REJECTED) {
            return@transaction AnswerApplicationResult.InvalidStatus
        }

        // 2. Get the application with topic info
        val applicationWithTopic = Applications.innerJoin(ThesesTopics)
            .select {
                (Applications.id eq applicationId) and
                        (Applications.promoterId eq supervisorId)
            }
            .singleOrNull() ?: return@transaction AnswerApplicationResult.NotFound

        val currentStatus = ApplicationStatus.fromCode(applicationWithTopic[Applications.status])
        val topicId = applicationWithTopic[Applications.topicId].value
        val studentId = applicationWithTopic[Applications.studentId].value
        val topicTitle = applicationWithTopic[ThesesTopics.title]
        val currentSlots = applicationWithTopic[ThesesTopics.availableSlots]

        // 3. Check if already processed
        if (currentStatus != ApplicationStatus.PENDING) {
            return@transaction AnswerApplicationResult.AlreadyProcessed
        }

        // 4. For confirmations, check available slots
        if (newStatus == ApplicationStatus.CONFIRMED && currentSlots <= 0) {
            return@transaction AnswerApplicationResult.NoSlots
        }

        // 5. Update the application status
        Applications.update({ Applications.id eq applicationId }) {
            it[status] = newStatus.code
            if (newStatus == ApplicationStatus.CONFIRMED) {
                it[confirmationToken] = null
            }
        }

        // 6. Additional actions for confirmed applications
        if (newStatus == ApplicationStatus.CONFIRMED) {
            // Decrease available slots
            ThesesTopics.update({ ThesesTopics.id eq topicId }) {
                with(SqlExpressionBuilder) {
                    it.update(availableSlots, availableSlots - 1)
                }
            }

            // Withdraw other pending applications from this student
            withdrawOtherApplications(studentId, applicationId)
        }

        // 7. Get student email for notification
        val studentEmail = Students.innerJoin(Users)
            .select { Students.id eq studentId }
            .singleOrNull()?.get(Users.email)
            ?: return@transaction AnswerApplicationResult.NotFound

        AnswerApplicationResult.Success(
            studentEmail = studentEmail,
            topicTitle = topicTitle,
            newStatus = newStatus
        )
    }

    fun withdrawApplication(
        applicationId: Int,
        studentId: Int
    ): ConfirmationResult = transaction {
        // 1. Get the application
        val application = Applications.select {
            (Applications.id eq applicationId) and (Applications.studentId eq studentId)
        }.singleOrNull() ?: return@transaction ConfirmationResult.NotFound

        // 2. Check if already confirmed
        if (application[Applications.status] == ApplicationStatus.CONFIRMED.code) {
            return@transaction ConfirmationResult.AlreadyConfirmed
        }

        // 3. Update status to WITHDRAWN
        Applications.update({ Applications.id eq applicationId }) {
            it[status] = ApplicationStatus.WITHDRAWN.code
            it[confirmationToken] = null
        }

        // 4. Get topic info to decrease slots
        val topicId = application[Applications.topicId].value
        ThesesTopics.update({ ThesesTopics.id eq topicId }) {
            with(SqlExpressionBuilder) {
                it.update(availableSlots, availableSlots + 1)
            }
        }

        // 5. Get student email for notification
        val studentEmail = Students.innerJoin(Users)
            .select { Students.id eq studentId }
            .singleOrNull()?.get(Users.email)
            ?: return@transaction ConfirmationResult.NotFound

        ConfirmationResult.Success(
            studentEmail = studentEmail,
            topicTitle = ThesesTopics.select { ThesesTopics.id eq topicId }
                .singleOrNull()?.get(ThesesTopics.title) ?: "Unknown Topic"
        )
    }
}