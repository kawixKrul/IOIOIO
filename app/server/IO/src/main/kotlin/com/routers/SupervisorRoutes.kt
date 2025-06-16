package com.routers

import com.repository.SupervisorRepository
import com.service.SupervisorService
import com.service.sendNotificationEmail
import com.utils.requireSupervisor
import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable

@Serializable
data class ThesisTopicRequest(
    val title: String,
    val description: String,
    val degreeLevel: String, // eg. "MSc", "BSc"
    val availableSlots: Int,
    val tags: List<String>
)

fun Route.supervisorRoutes(supervisorService: SupervisorService, appBaseUrl: String, mailApiKey: String, mailDomain: String) {
    get("/supervisor/profile") {
        val userId = call.requireSupervisor() ?: return@get
        val profile = supervisorService.getProfile(userId)
        if (profile == null) {
            call.respond(HttpStatusCode.NotFound, "Supervisor not found")
        } else {
            call.respond(profile)
        }
    }
    get("/supervisor/topics") {
        val supervisorId = call.requireSupervisor() ?: return@get
        val topics = supervisorService.getSupervisorTopics(supervisorId)
        call.respond(topics)
    }

    post("/supervisor/topics") {
        val userId = call.requireSupervisor() ?: return@post
        val req = call.receive<ThesisTopicRequest>()
        if (req.title.isBlank() || req.description.isBlank() || req.availableSlots <= 0) {
            call.respond(HttpStatusCode.BadRequest, "Invalid request data")
            return@post
        }
        val ok = supervisorService.addThesisTopic(userId, req)
        if (!ok) {
            call.respond(HttpStatusCode.BadRequest, "Supervisor not found")
        } else {
            call.respond(HttpStatusCode.Created, "Thesis topic added successfully")
        }
    }

    get("/supervisor/applications") {
        val supervisorId = call.requireSupervisor() ?: return@get
        call.respond(
            HttpStatusCode.OK,
            supervisorService.getSupervisorApplications(supervisorId)
        )
    }

    get("/supervisor/confirm-application") {
        val userId = call.requireSupervisor() ?: return@get
        val token = call.request.queryParameters["token"]
        if (token.isNullOrBlank()) {
            call.respond(HttpStatusCode.BadRequest, "Activation token is missing.")
            return@get
        }
        when (val result = supervisorService.confirmApplication(token)) {
            is SupervisorService.ConfirmationResult.Success -> {
                call.application.launch {
                    sendNotificationEmail(
                        mailApiKey,
                        mailDomain,
                        email = result.studentEmail,
                        subject = "Your application has been confirmed!",
                        text = """
                            Your supervisor has confirmed your application for the topic: ${result.topicTitle}.
                            Congratulations!
                        """.trimIndent()
                    )
                }
                call.respondText("Application confirmed! The student has been notified.")
            }
            SupervisorService.ConfirmationResult.AlreadyConfirmed ->
                call.respond(HttpStatusCode.BadRequest, "Student already has a confirmed application.")
            SupervisorService.ConfirmationResult.NoSlots ->
                call.respond(HttpStatusCode.BadRequest, "No available slots for this topic.")
            SupervisorService.ConfirmationResult.NotFound ->
                call.respond(HttpStatusCode.BadRequest, "Invalid token or application not found.")
        }
    }
}
