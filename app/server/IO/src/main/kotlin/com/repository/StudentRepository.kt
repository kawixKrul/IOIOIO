package com.repository

import com.database.table.*
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction

class StudentRepository {
    fun getStudentIdAndEmail(userId: Int): Pair<Int, String>? = transaction {
        Students.innerJoin(Users)
            .select { Students.userId eq userId }
            .singleOrNull()
            ?.let { it[Students.id].value to it[Users.email] }
    }

    fun studentHasConfirmedApplication(studentId: Int): Boolean = transaction {
        Applications.select {
            (Applications.studentId eq studentId) and
                    (Applications.status eq ApplicationStatus.CONFIRMED.code)
        }.count() > 0
    }

    fun studentAlreadyApplied(studentId: Int, topicId: Int): Boolean = transaction {
        Applications.select {
            (Applications.studentId eq studentId) and
                    (Applications.topicId eq topicId)
        }.count() > 0
    }

    data class TopicData(
        val promoterId: Int,
        val topicTitle: String,
        val promoterEmail: String,
        val availableSlots: Int
    )

    fun getTopicData(topicId: Int): TopicData? = transaction {
        (ThesesTopics innerJoin Supervisors innerJoin Users)
            .select { ThesesTopics.id eq topicId }
            .singleOrNull()
            ?.let {
                TopicData(
                    promoterId = it[Supervisors.id].value,
                    topicTitle = it[ThesesTopics.title],
                    promoterEmail = it[Users.email],
                    availableSlots = it[ThesesTopics.availableSlots]
                )
            }
    }

    fun insertApplication(
        studentId: Int,
        promoterId: Int,
        topicId: Int,
        description: String,
        status: Int,
        confirmationToken: String
    ): Int = transaction {
        Applications.insertAndGetId {
            it[Applications.studentId] = studentId
            it[Applications.promoterId] = promoterId
            it[Applications.topicId] = topicId
            it[Applications.description] = description
            it[Applications.status] = status
            it[Applications.confirmationToken] = confirmationToken
        }.value
    }

    fun getAllTopics(): List<ResultRow> = transaction {
        (ThesesTopics innerJoin Supervisors innerJoin Users).selectAll().toList()
    }

    fun searchTopics(query: String, degreeFilter: String?): List<ResultRow> = transaction {
        val baseQuery = ThesesTopics innerJoin Supervisors innerJoin Users
        baseQuery.select {
            (
                    LowerCase(ThesesTopics.title).like("%$query%") or
                            LowerCase(ThesesTopics.tagsList).like("%$query%")
                    ) and (degreeFilter?.let { ThesesTopics.degreeLevel.lowerCase() eq it } ?: Op.TRUE)
        }.toList()
    }

    fun getStudentApplications(studentId: Int): List<ResultRow> = transaction {
        (Applications
            .innerJoin(ThesesTopics, { Applications.topicId }, { ThesesTopics.id })
            .innerJoin(Supervisors, { Applications.promoterId }, { Supervisors.id })
            .innerJoin(Users, { Supervisors.userId }, { Users.id })
                ).select { Applications.studentId eq studentId }.toList()
    }
}
