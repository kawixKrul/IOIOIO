package com.routers

import com.service.AdminService
import com.utils.requireAdmin
import io.ktor.server.response.*
import io.ktor.server.routing.*


fun Routing.adminRoutes(adminService: AdminService) {
    get("/admin/panel") {
        val userId = call.requireAdmin() ?: return@get
        call.respondText("Welcome to admin panel.")
    }

    get("/admin/students") {
        val userId = call.requireAdmin() ?: return@get
        call.respond(adminService.getAllStudents())
    }

    get("/admin/supervisors") {
        val userId = call.requireAdmin() ?: return@get
        call.respond(adminService.getAllSupervisors())
    }
}
