package com.service


import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.logging.*
import io.ktor.client.request.*
import io.ktor.client.request.forms.*
import io.ktor.client.statement.*
import io.ktor.http.*

fun loadEmailTemplate(
    resourcePath: String,
    replacements: Map<String, String?>
): String {
    val stream = object {}.javaClass.getResourceAsStream(resourcePath)
        ?: throw IllegalArgumentException("Nie znaleziono pliku zasobu: $resourcePath")
    var content = stream.bufferedReader(Charsets.UTF_8).readText()

    for ((key, value) in replacements) {
        content = content.replace("{{${key}}}", value ?: "")
    }
    return content
}


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

        val subject = "Activate your account"
        val message = "Click the button below to activate your account."
        val htmlBody = loadEmailTemplate(
            "/email_template.html",   // Zwróć uwagę na "/" na początku!
            mapOf(
                "subject" to subject,
                "message" to message,
                "buttonLink" to activationLink,
                "buttonText" to "Activate Account"
            )
        )


        val response: HttpResponse = client.submitForm(
            url = "https://api.mailgun.net/v3/$domain/messages",
            formParameters = Parameters.build {
                append("from", "no-reply@$domain")
                append("to", email)
                append("subject", subject)
                append("text", "$message $activationLink")
                append("html", htmlBody)
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
    text: String,
    buttonLink: String? = null,
    buttonText: String? = null
) {
    val client = HttpClient(CIO) {
        install(Logging) {
            level = LogLevel.ALL
            logger = Logger.DEFAULT
        }
    }

    try {
        println("Sending notification email to $email...")

        val htmlBody = loadEmailTemplate(
            "/email_template.html",
            mapOf(
                "subject" to subject,
                "message" to text,
                "buttonLink" to buttonLink,
                "buttonText" to buttonText
            )
        )
        
        val response: HttpResponse = client.submitForm(
            url = "https://api.mailgun.net/v3/$domain/messages",
            formParameters = Parameters.build {
                append("from", "no-reply@$domain")
                append("to", email)
                append("subject", subject)
                append("text", text)
                append("html", htmlBody)
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
