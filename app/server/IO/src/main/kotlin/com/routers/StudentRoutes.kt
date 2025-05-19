package com.routers

import com.database.table.*
import com.service.sendNotificationEmail
import com.utils.currentUserId
import com.utils.requireSupervisor
import io.ktor.server.routing.*
import io.ktor.server.response.*
import io.ktor.http.*
import io.ktor.server.application.log
import io.ktor.server.request.*
import kotlinx.coroutines.launch
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import java.util.*

@Serializable
data class ThesisTopicResponse(
    val id: Int,
    val title: String,
    val description: String,
    val degreeLevel: String,
    val availableSlots: Int,
    val tags: List<String>,
    val promoter: PromoterInfo
)

@Serializable
data class PromoterInfo(
    val id: Int,
    val name: String,
    val surname: String,
    val expertiseField: String
)

@Serializable
data class ApplyTopicRequest(
    val topicId: Int,
    val description: String
)


fun Route.studentRoutes(appBaseUrl: String, mailApiKey: String, mailDomain: String) {
    get("/profile") {
        val userId = call.currentUserId() ?: return@get
        // Now you can use userId to fetch user info from the DB
        call.respond(HttpStatusCode.OK, "You are logged in as user ID: $userId")
    }

    get("/student/topics") {
        val userId = call.currentUserId() ?: return@get
        val topics = transaction {
            (ThesesTopics innerJoin Supervisors innerJoin Users)
                .selectAll()
                .map {
                    ThesisTopicResponse(
                        id = it[ThesesTopics.id].value,
                        title = it[ThesesTopics.title],
                        description = it[ThesesTopics.description],
                        degreeLevel = it[ThesesTopics.degreeLevel],
                        availableSlots = it[ThesesTopics.availableSlots],
                        tags = it[ThesesTopics.tagsList].split(",").map { tag -> tag.trim() },
                        promoter = PromoterInfo(
                            id = it[Supervisors.id].value,
                            name = it[Users.name],
                            surname = it[Users.surname],
                            expertiseField = it[Supervisors.expertiseField]
                        )
                    )
                }
        }
        call.respond(HttpStatusCode.OK, topics)
    }

    post("/student/apply") {
        val userId = call.currentUserId()
        if (userId == null) {
            call.respond(HttpStatusCode.Unauthorized, "Unauthorized")
            return@post
        }

        val req = call.receive<ApplyTopicRequest>()

        val (studentId, studentEmail) = transaction {
            Students.innerJoin(Users)
                .select { Students.userId eq userId }
                .singleOrNull()
                ?.let { it[Students.id].value to it[Users.email] }
        } ?: run {
            call.respond(HttpStatusCode.BadRequest, "Student profile not found.")
            return@post
        }

        // Check if student already has a confirmed application**
        val alreadyConfirmed = transaction {
            Applications.select {
                (Applications.studentId eq studentId) and (Applications.status eq 1)
            }.count() > 0
        }
        if (alreadyConfirmed) {
            call.respond(HttpStatusCode.Conflict, "You already have a confirmed application and cannot apply for another topic.")
            return@post
        }

        val topicData = transaction {
            (ThesesTopics innerJoin Supervisors innerJoin Users)
                .select { ThesesTopics.id eq req.topicId }
                .singleOrNull()
                ?.let {
                    Triple(
                        it[Supervisors.id].value,
                        it[ThesesTopics.title],
                        it[Users.email]
                    ) to it[ThesesTopics.availableSlots]
                }
        } ?: run {
            call.respond(HttpStatusCode.NotFound, "Topic not found.")
            return@post
        }

        val (promoterInfo, availableSlots) = topicData

        if (availableSlots <= 0) {
            call.respond(HttpStatusCode.BadRequest, "No available slots.")
            return@post
        }

        val (promoterId, topicTitle, promoterEmail) = promoterInfo

        // Zapobiegaj podwójnej aplikacji
        val alreadyApplied = transaction {
            Applications.select {
                (Applications.studentId eq studentId) and (Applications.topicId eq req.topicId)
            }.count() > 0
        }
        if (alreadyApplied) {
            call.respond(HttpStatusCode.Conflict, "Already applied for this topic.")
            return@post
        }

        val confirmationToken = UUID.randomUUID().toString()
        val applicationId = transaction {
            Applications.insertAndGetId {
                it[Applications.studentId] = studentId
                it[Applications.promoterId] = promoterId
                it[Applications.topicId] = req.topicId
                it[Applications.description] = req.description
                it[Applications.status] = 0 // pending
                it[Applications.confirmationToken] = confirmationToken
            }
        }

        val activationLink = "$appBaseUrl/promoter/confirm-application?token=$confirmationToken"
        call.application.launch {
            try {
                sendNotificationEmail(
                    mailApiKey,
                    mailDomain,
                    promoterEmail,
                    "Nowa aplikacja studenta na temat: $topicTitle",
                    """
                Student złożył aplikację na Twój temat (ID: ${req.topicId}, tytuł: $topicTitle).
                Aby potwierdzić aplikację, kliknij poniższy link:
                $activationLink

                Jeśli to nie Ty, zignoruj tę wiadomość.
            """.trimIndent()
                )
            } catch (e: Exception) {
                call.application.log.error("Failed to send notification email to $promoterEmail for topic $topicTitle", e)
            }
        }
        call.respond(HttpStatusCode.OK, "Application has been sent. Supervisor is notified.")
    }

}
