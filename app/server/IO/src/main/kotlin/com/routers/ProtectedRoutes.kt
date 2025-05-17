package com.routers

import com.utils.currentUserId
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.http.*

fun Route.protectedRoutes() {
    get("/profile") {
        val userId = call.currentUserId()
        if (userId == null) {
            call.respond(HttpStatusCode.Unauthorized, "You are not logged in.")
            return@get
        }
        // Now you can use userId to fetch user info from the DB
        call.respond(HttpStatusCode.OK, "You are logged in as user ID: $userId")
    }
}
