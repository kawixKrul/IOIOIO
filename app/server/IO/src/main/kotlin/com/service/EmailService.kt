package com.service

import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.logging.*
import io.ktor.client.request.*
import io.ktor.client.request.forms.*
import io.ktor.client.statement.*
import io.ktor.http.*

suspend fun sendActivationEmail(
    apiKey: String,
    domain: String,
    email: String,
    activationLink: String
) {
    val client = HttpClient(CIO) {
        install(Logging) {
            level = LogLevel.ALL
            logger = Logger.DEFAULT
        }
    }

    try {
        println("Sending activation email to $email...")

        val response: HttpResponse = client.submitForm(
            url = "https://api.mailgun.net/v3/$domain/messages",
            formParameters = Parameters.build {
                append("from", "no-reply@$domain")
                append("to", email)
                append("subject", "Activate your account")
                append("text", "Click this link to activate your account: $activationLink")
            }
        ) {
            basicAuth("api", apiKey)
        }

        println("Email sent to $email with status: ${response.status}")
        println("Response body: ${response.bodyAsText()}")

    } catch (e: Exception) {
        println("Failed to send email to $email: ${e.message}")
        e.printStackTrace()
    } finally {
        client.close()
        println("Email client closed.")
    }
}

suspend fun sendNotificationEmail(
    apiKey: String,
    domain: String,
    email: String,
    subject: String,
    text: String
) {
    val client = HttpClient(CIO) {
        install(Logging) {
            level = LogLevel.ALL
            logger = Logger.DEFAULT
        }
    }

    try {
        println("Sending notification email to $email...")

        val response: HttpResponse = client.submitForm(
            url = "https://api.mailgun.net/v3/$domain/messages",
            formParameters = Parameters.build {
                append("from", "no-reply@$domain")
                append("to", email)
                append("subject", subject)
                append("text", text)
            }
        ) {
            basicAuth("api", apiKey)
        }

        println("Notification email sent to $email with status: ${response.status}")
        println("Response body: ${response.bodyAsText()}")

    } catch (e: Exception) {
        println("Failed to send notification email to $email: ${e.message}")
        e.printStackTrace()
    } finally {
        client.close()
        println("Email client closed.")
    }
}
