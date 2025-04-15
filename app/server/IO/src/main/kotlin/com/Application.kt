package com

import com.database.service.StudentService
import com.database.connectToDatabase
import com.database.createTables
import com.database.table.Students
import io.ktor.server.application.*
import org.jetbrains.exposed.sql.ResultRow
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction

fun main(args: Array<String>) {
    io.ktor.server.netty.EngineMain.main(args)
}

fun Application.module() {
    configureSecurity()
    configureRouting()

    connectToDatabase()

    createTables()
    println("Database connected and all tables are created.")

    val studentService = StudentService()
    
//    studentService.addStudent(
//        mail = "test1@example.com",
//        password = "secret",
//        name = "Maria",
//        surname = "Kowalska"
//    )
//    println("New student added.")


    println("All students:")
    studentService.getAllStudents().forEach { student ->
        println("ID: ${student[Students.id]}, Email: ${student[Students.mail]}, Name: ${student[Students.name]} ${student[Students.surname]}")
    }
}
