package com.routers

import com.database.table.ApplicationStatus
import com.repository.SupervisorRepository
import com.service.ApplicationService
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

    delete("/supervisor/topics/{topicId}") {
        val userId = call.requireSupervisor() ?: return@delete
        val topicId = call.parameters["topicId"]?.toIntOrNull()
        if (topicId == null) {
            call.respond(HttpStatusCode.BadRequest, "Invalid topic ID")
            return@delete
        }
        val success = supervisorService.deleteThesisTopic(userId, topicId)
        if (success) {
            call.respond(HttpStatusCode.OK, "Thesis topic deleted successfully")
        } else {
            call.respond(HttpStatusCode.NotFound, "Thesis topic not found or you don't have permission")
        }
    }


    post("/supervisor/answer-application") {
        // Ensure supervisor authentication
        val userId = call.requireSupervisor() ?: return@post

        // Parse and validate parameters
        val applicationId = call.request.queryParameters["applicationId"]?.toIntOrNull()
        val statusParam = call.request.queryParameters["status"]?.lowercase()

        when {
            applicationId == null -> {
                call.respond(HttpStatusCode.BadRequest, "Valid application ID is required")
                return@post
            }
            statusParam.isNullOrBlank() -> {
                call.respond(HttpStatusCode.BadRequest, "Status parameter is required (accept/reject)")
                return@post
            }
        }

        // Convert to ApplicationStatus enum
        val status = when (statusParam) {
            "accept" -> ApplicationStatus.CONFIRMED
            "reject" -> ApplicationStatus.REJECTED
            else -> {
                call.respond(HttpStatusCode.BadRequest, "Invalid status. Use 'accept' or 'reject'")
                return@post
            }
        }

        // Process the application response
        when (val result = applicationId?.let {
            supervisorService.answerApplication(
                applicationId = it,
                newStatus = status,
                supervisorId = userId
            )
        }) {
            is ApplicationService.AnswerApplicationResult.Success -> {
                // Prepare notification
                val (subject, text) = when (result.newStatus) {
                    ApplicationStatus.CONFIRMED -> {
                        "Application Accepted" to """
                        Your application for "${result.topicTitle}" has been accepted!
                        
                        Next Steps:
                        1. Contact your supervisor to discuss next steps
                        2. Complete any required paperwork
                        3. Begin your research work
                        
                        Congratulations!
                    """.trimIndent()
                    }
                    ApplicationStatus.REJECTED -> {
                        "Application Status Update" to """
                        Your application for "${result.topicTitle}" has been reviewed.
                        
                        Unfortunately, the supervisor has decided not to proceed with your application
                        at this time. You may:
                        
                        1. Apply for other available topics
                        2. Contact the supervisor for feedback
                        3. Consult with your program advisor
                    """.trimIndent()
                    }
                    else -> "" to ""
                }

                // Send notification asynchronously
                call.application.launch {
                    sendNotificationEmail(
                        apiKey = mailApiKey,
                        domain = mailDomain,
                        email = result.studentEmail,
                        subject = subject,
                        text = text
                    )
                }

                call.respond(HttpStatusCode.OK, mapOf(
                    "message" to "Application status updated successfully",
                    "status" to result.newStatus.name.lowercase(),
                    "topic" to result.topicTitle,
                    "notificationSent" to true
                ))
            }

            ApplicationService.AnswerApplicationResult.NotFound -> {
                call.respond(HttpStatusCode.NotFound, "Application not found or you don't have permission")
            }

            ApplicationService.AnswerApplicationResult.NoSlots -> {
                call.respond(HttpStatusCode.Conflict, "No available slots remaining for this topic")
            }

            ApplicationService.AnswerApplicationResult.InvalidStatus -> {
                call.respond(HttpStatusCode.BadRequest, "Invalid status transition for this application")
            }

            ApplicationService.AnswerApplicationResult.AlreadyProcessed -> {
                call.respond(HttpStatusCode.Conflict, "This application has already been processed")
            }

            null -> TODO()
        }
    }

    get("/supervisor/confirm-application") {
        val userId = call.requireSupervisor() ?: return@get
        val token = call.request.queryParameters["token"]
        if (token.isNullOrBlank()) {
            call.respond(HttpStatusCode.BadRequest, "Activation token is missing.")
            return@get
        }
        when (val result = supervisorService.confirmApplication(token)) {
            is ApplicationService.ConfirmationResult.Success -> {
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
            ApplicationService.ConfirmationResult.AlreadyConfirmed ->
                call.respond(HttpStatusCode.BadRequest, "Student already has a confirmed application.")
            ApplicationService.ConfirmationResult.NoSlots ->
                call.respond(HttpStatusCode.BadRequest, "No available slots for this topic.")
            ApplicationService.ConfirmationResult.NotFound ->
                call.respond(HttpStatusCode.BadRequest, "Invalid token or application not found.")
        }
    }

}
