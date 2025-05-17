package com

import com.routers.loginRoutes
import com.routers.protectedRoutes
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import com.routers.registrationRoutes

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

        protectedRoutes()
    }

}

