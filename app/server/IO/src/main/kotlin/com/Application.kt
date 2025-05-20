package com

import com.service.StudentService
import com.database.connectToDatabase
import com.database.createInitialAdmin
import com.database.createTables
import com.database.table.Students
import com.database.table.Users
import io.ktor.server.application.*
import io.github.cdimascio.dotenv.dotenv
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.plugins.contentnegotiation.*
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.transactions.transaction
import io.ktor.server.plugins.cors.routing.*
import io.ktor.http.*

fun main(args: Array<String>) {
    io.ktor.server.netty.EngineMain.main(args)
}

fun Application.module() {

    install(ContentNegotiation) {
        json()
    }
    
    // Configure CORS
    install(CORS) {
        allowMethod(HttpMethod.Options)
        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Post)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Delete)
        allowHeader(HttpHeaders.ContentType)
        allowHeader(HttpHeaders.Authorization)
        allowCredentials = true
        anyHost() // For development only - in production, specify hosts
        // Alternative: Only allow specific origins
        // allowHost("localhost:3000", schemes = listOf("http", "https"))
    }

    // Read configuration from .env using dotenv
    val dotenv = dotenv()
    val appBaseUrl = dotenv["APP_BASE_URL"] ?: "http://localhost:8080"
    val mailgunApiKey = dotenv["MAILGUN_API_KEY"] ?: error("Missing Mailgun API key")
    val mailgunDomain = dotenv["MAILGUN_DOMAIN"] ?: error("Missing Mailgun domain")

    configureSecurity()
    configureRouting(
        appBaseUrl = appBaseUrl,
        mailgunApiKey = mailgunApiKey,
        mailgunDomain = mailgunDomain
    )

    connectToDatabase()
    createTables()
    println("Database connected and all tables are created.")

    createInitialAdmin()
    println("Initial admin created. Email: admin@agh.edu.pl, Password: admin123")

    val studentService = StudentService()
    // Sample usage (uncomment as needed)
    // studentService.addStudent("bialecki@example.com", "marcinbialecki1", "Marcin", "Białecki")
    // println("New student added.")

//    println("All students:")
//    studentService.getAllStudents().forEach { student ->
//        println(
//            "ID: ${student[Students.id]}, Email: ${student[Students.mail]}, Password: ${student[Students.password]}, " +
//                    "Name: ${student[Students.name]}, Surname: ${student[Students.surname]}"
//        )
//    }
}
