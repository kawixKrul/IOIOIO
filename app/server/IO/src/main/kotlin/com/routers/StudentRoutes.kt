package com.routers

import com.database.table.ThesesTopics
import com.database.table.Supervisors
import com.database.table.Users
import com.utils.currentUserId
import com.utils.requireSupervisor
import io.ktor.server.routing.*
import io.ktor.server.response.*
import io.ktor.http.*
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import kotlinx.serialization.Serializable

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

fun Route.studentRoutes() {
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
}
