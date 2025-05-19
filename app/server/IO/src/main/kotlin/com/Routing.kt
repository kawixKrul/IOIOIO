package com

import com.routers.adminRoutes
import com.routers.loginRoutes
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import com.routers.registrationRoutes
import com.routers.studentRoutes
import com.routers.supervisorRoutes

fun Application.configureRouting(
    appBaseUrl: String,
    mailgunApiKey: String,
    mailgunDomain: String
) {
    routing {
        get("/") {
            call.respondText("Hello World!")
        }
        get("/healthcheck") {
            call.respondText("HEALTHCHECK")
        }

        registrationRoutes(appBaseUrl, mailgunApiKey, mailgunDomain)

        loginRoutes()

        adminRoutes()

        supervisorRoutes()

        studentRoutes()
    }

}

