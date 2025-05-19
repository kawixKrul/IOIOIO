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


    get("/promoter/confirm-application") {
        val token = call.request.queryParameters["token"]
        if (token.isNullOrBlank()) {
            call.respond(HttpStatusCode.BadRequest, "Brak tokenu aktywacyjnego.")
            return@get
        }

        val (updated, studentEmail, topicTitle) = transaction {
            val app = Applications.innerJoin(ThesesTopics)
                .select { (Applications.confirmationToken eq token) and (Applications.status eq 0) }
                .singleOrNull()
            if (app != null) {
                Applications.update({ Applications.id eq app[Applications.id].value }) {
                    it[status] = 1 // confirmed
                    it[confirmationToken] = null
                }
                val studentId = app[Applications.studentId].value
                val email = Students.innerJoin(Users)
                    .select { Students.id eq studentId }
                    .singleOrNull()?.get(Users.email)
                Triple(1, email, app[ThesesTopics.title])
            } else {
                Triple(0, null, null)
            }
        }

        if (updated == 1 && studentEmail != null && topicTitle != null) {
            // Wyślij powiadomienie do studenta
            call.application.launch {
                sendNotificationEmail(
                    mailApiKey,
                    mailDomain,
                    email = studentEmail,
                    subject = "Twoja aplikacja została potwierdzona!",
                    text = """
                        Promotor potwierdził Twoją aplikację na temat: $topicTitle.
                        Gratulacje!
                    """.trimIndent()
                )
            }
            call.respondText("Aplikacja została potwierdzona! Student otrzyma powiadomienie.")
        } else {
            call.respond(HttpStatusCode.BadRequest, "Nieprawidłowy lub już wykorzystany token.")
        }
    }


}