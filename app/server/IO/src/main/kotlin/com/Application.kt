package com

import com.database.connectToDatabase
import com.database.createInitialAdmin
import com.database.createTables
import com.database.alterTables
import com.repository.*
import com.routers.*
import com.service.*
import io.github.cdimascio.dotenv.dotenv
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun main(args: Array<String>) {
    io.ktor.server.netty.EngineMain.main(args)
}

fun Application.module() {
    Thread.sleep(5000)
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

    val adminRepository = AdminRepository()
    val adminService = AdminService(adminRepository)

    val studentRepository = StudentRepository()
    val studentService = StudentService(studentRepository)

    val supervisorRepository = SupervisorRepository()
    val supervisorService = SupervisorService(supervisorRepository)

    val registrationRepository = RegistrationRepository()
    val registrationService = RegistrationService(registrationRepository)

    val authRepository = AuthRepository()
    val authService = AuthService(authRepository)

    connectToDatabase()
    createTables()
    alterTables()
    println("Database connected and all tables are created.")

    createInitialAdmin()
    println("Initial admin created. Email: admin@agh.edu.pl, Password: admin123")

    configureSecurity()
    routing {
        get("/") {
            call.respondText("Hello World!")
        }
        get("/healthcheck") {
            call.respondText("HEALTHCHECK")
        }

        registrationRoutes(registrationService, appBaseUrl, mailgunApiKey, mailgunDomain)
        loginRoutes(authService)
        adminRoutes(adminService)
        supervisorRoutes(supervisorService, appBaseUrl, mailgunApiKey, mailgunDomain)
        studentRoutes(studentService, appBaseUrl, mailgunApiKey, mailgunDomain)
    }


}
