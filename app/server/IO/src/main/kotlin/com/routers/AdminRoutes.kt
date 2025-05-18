package com.routers

import com.database.table.Students
import com.database.table.Supervisors
import com.database.table.Users
import com.utils.UserRequest
import com.utils.requireAdmin
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction

fun Routing.adminRoutes() {
    get("/admin/panel") {
        val userId = call.requireAdmin() ?: return@get
        call.respondText("Welcome to admin panel.")
    }

    get("/admin/students") {
        val userId = call.requireAdmin() ?: return@get
        val students = transaction {
            (Students innerJoin Users)
                .select { Users.role eq "student" }
                .map {
                    UserRequest(
                        id = it[Users.id].value,
                        email = it[Users.email],
                        name = it[Users.name],
                        surname = it[Users.surname]
                    )
                }
        }
        call.respond(students)
    }

    get("/admin/supervisors") {
        val userId = call.requireAdmin() ?: return@get
        val supervisors = transaction {
            (Supervisors innerJoin Users)
                .select { Users.role eq "supervisor" }
                .map {
                    UserRequest(
                        id = it[Users.id].value,
                        email = it[Users.email],
                        name = it[Users.name],
                        surname = it[Users.surname],
                        expertiseField = it[Supervisors.expertiseField]
                    )
                }
        }
        call.respond(supervisors)
    }
}