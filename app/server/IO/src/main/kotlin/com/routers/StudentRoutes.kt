package com.routers

import com.repository.StudentRepository
import com.service.StudentService
import com.service.sendNotificationEmail
import com.utils.currentUserId
import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable
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
data class ApplicationsResponse(
    val id: Int,
    val topicId: Int,
    val topicTitle: String,
    val description: String,
    val status: Int, // 0=PENDING, 1=CONFIRMED, etc.
    val promoter: PromoterInfo
)

@Serializable
data class ApplyTopicRequest(
    val topicId: Int,
    val description: String
)

fun Route.studentRoutes(studentService: StudentService, appBaseUrl: String, mailApiKey: String, mailDomain: String) {
    get("/profile") {
        val userId = call.currentUserId() ?: return@get
        call.respond(HttpStatusCode.OK, "You are logged in as user ID: $userId")
    }

    get("/student/topics") {
        val userId = call.currentUserId() ?: return@get
        call.respond(HttpStatusCode.OK, studentService.getTopics())
    }

    get("/student/topics/search") {
        val userId = call.currentUserId() ?: return@get
        val query = call.request.queryParameters["q"]?.trim()?.lowercase()
        val rawDegreeFilter = call.request.queryParameters["degree"]?.trim()?.lowercase()
        val degreeFilter = when (rawDegreeFilter) {
            "bsc" -> "bsc"
            "msc" -> "msc"
            else -> null
        }

        if (query.isNullOrBlank()) {
            call.respond(HttpStatusCode.BadRequest, "Query parameter 'q' is required.")
            return@get
        }

        call.respond(HttpStatusCode.OK, studentService.searchTopics(query, degreeFilter))
    }

    get("/student/applications") {
        val userId = call.currentUserId() ?: return@get
        call.respond(HttpStatusCode.OK, studentService.getStudentApplications(userId))
    }

    post("/student/apply") {
        val userId = call.currentUserId() ?: return@post
        val req = call.receive<ApplyTopicRequest>()
        val confirmationToken = UUID.randomUUID().toString()

        when (val result = studentService.applyForTopic(userId, req, confirmationToken)) {
            StudentService.ApplyResult.StudentNotFound ->
                call.respond(HttpStatusCode.BadRequest, "Student profile not found.")
            StudentService.ApplyResult.AlreadyConfirmed ->
                call.respond(HttpStatusCode.Conflict, "You already have a confirmed application and cannot apply for another topic.")
            StudentService.ApplyResult.TopicNotFound ->
                call.respond(HttpStatusCode.NotFound, "Topic not found.")
            StudentService.ApplyResult.NoSlots ->
                call.respond(HttpStatusCode.BadRequest, "No available slots.")
            StudentService.ApplyResult.AlreadyApplied ->
                call.respond(HttpStatusCode.Conflict, "Already applied for this topic.")
            is StudentService.ApplyResult.Success -> {
                val activationLink = "$appBaseUrl/supervisor/confirm-application?token=${result.confirmationToken}"
                call.application.launch {
                    sendNotificationEmail(
                        mailApiKey,
                        mailDomain,
                        result.promoterEmail,
                        "Nowa aplikacja studenta na temat: ${result.topicTitle}",
                        """
                            Student złożył aplikację na Twój temat (tytuł: ${result.topicTitle}).
                            Aby potwierdzić aplikację, kliknij poniższy link:
                            $activationLink
                            
                            Jeśli to nie Ty, zignoruj tę wiadomość.
                        """.trimIndent()
                    )
                }
                call.respond(HttpStatusCode.OK, "Application has been sent. Supervisor is notified.")
            }
        }
    }
}
