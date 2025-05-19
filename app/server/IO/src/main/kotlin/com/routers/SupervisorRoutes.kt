package com.routers

import com.database.table.*
import com.service.sendNotificationEmail
import com.utils.requireSupervisor
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction

@Serializable
data class SupervisorRequest(
    val id: Int,
    val email: String,
    val name: String,
    val surname: String,
    val expertiseField: String? = null
)

@Serializable
data class ThesisTopicRequest(
    val title: String,
    val description: String,
    val degreeLevel: String, // eg. "MSc", "BSc"
    val availableSlots: Int,
    val tags: List<String>
)

fun Route.supervisorRoutes(appBaseUrl: String, mailApiKey: String, mailDomain: String) {
    get("/supervisor/profile") {
        val userId = call.requireSupervisor() ?: return@get

        val profile = transaction {
            (Users innerJoin Supervisors)
                .select { Users.id eq userId }
                .map {
                    SupervisorRequest(
                        id = it[Users.id].value,
                        email = it[Users.email],
                        name = it[Users.name],
                        surname = it[Users.surname],
                        expertiseField = it[Supervisors.expertiseField]
                    )
                }
                .singleOrNull()
        }

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

        val supervisorId = transaction {
            Supervisors.select { Supervisors.userId eq userId }
                .map { it[Supervisors.id].value }
                .singleOrNull()
        }

        if (supervisorId == null) {
            call.respond(HttpStatusCode.BadRequest, "Supervisor not found")
            return@post
        }

        transaction {
            ThesesTopics.insert {
                it[promoterId] = supervisorId
                it[title] = req.title
                it[description] = req.description
                it[degreeLevel] = req.degreeLevel
                it[availableSlots] = req.availableSlots
                it[tagsList] = req.tags.joinToString(",")
            }
        }

        call.respond(HttpStatusCode.Created, "Thesis topic added successfully")
    }


    get("/supervisor/confirm-application") {
        val userId = call.requireSupervisor() ?: return@get
        val token = call.request.queryParameters["token"]
        if (token.isNullOrBlank()) {
            println("No activation token provided.")
            call.respond(HttpStatusCode.BadRequest, "Activation token is missing.")
            return@get
        }

        val (updated, studentEmail, topicTitle) = transaction {
            val app = Applications.innerJoin(ThesesTopics)
                .select { (Applications.confirmationToken eq token) and (Applications.status eq 0) }
                .singleOrNull()

            if (app != null) {
                val studentId = app[Applications.studentId].value
                val topicId = app[Applications.topicId].value
                val currentSlots = app[ThesesTopics.availableSlots]

                println("Found application for studentId=$studentId, topicId=$topicId with $currentSlots available slots.")

                // Check if student already has a confirmed application
                val studentHasConfirmed = Applications.select {
                    (Applications.studentId eq studentId) and (Applications.status eq 1)
                }.count() > 0

                if (studentHasConfirmed) {
                    println("Student $studentId already has a confirmed application.")
                    return@transaction Triple(0, null, null)
                }

                if (currentSlots <= 0) {
                    println("No available slots left for topic $topicId.")
                    return@transaction Triple(0, null, null)
                }

                // Confirm this application
                Applications.update({ Applications.id eq app[Applications.id].value }) {
                    it[status] = 1 // confirmed
                    it[confirmationToken] = null
                }
                println("Application ${app[Applications.id].value} confirmed.")

                // Decrease the number of available slots by 1
                ThesesTopics.update({ ThesesTopics.id eq topicId }) {
                    with(SqlExpressionBuilder) {
                        it.update(ThesesTopics.availableSlots, ThesesTopics.availableSlots - 1)
                    }
                }
                println("Decreased available slots for topic $topicId by 1.")

                // Reject other pending applications from the same student
                Applications.update({
                    (Applications.studentId eq studentId) and
                            (Applications.status eq 0) and
                            (Applications.id neq app[Applications.id].value)
                }) {
                    it[status] = 2 // rejected
                    it[confirmationToken] = null
                }
                println("Rejected other pending applications for student $studentId.")

                val email = Students.innerJoin(Users)
                    .select { Students.id eq studentId }
                    .singleOrNull()?.get(Users.email)

                Triple(1, email, app[ThesesTopics.title])
            } else {
                println("No application found with given token or already confirmed.")
                Triple(0, null, null)
            }
        }

        if (updated == 1 && studentEmail != null && topicTitle != null) {
            // Send notification email to the student
            call.application.launch {
                sendNotificationEmail(
                    mailApiKey,
                    mailDomain,
                    email = studentEmail,
                    subject = "Your application has been confirmed!",
                    text = """
                    Your supervisor has confirmed your application for the topic: $topicTitle.
                    Congratulations!
                """.trimIndent()
                )
            }
            println("Notification email sent to $studentEmail.")
            call.respondText("Application confirmed! The student has been notified.")
        } else {
            println("Failed to confirm application: invalid token, no slots, or student already confirmed.")
            call.respond(HttpStatusCode.BadRequest, "Invalid token, no available slots, or student already has a confirmed application.")
        }
    }


}