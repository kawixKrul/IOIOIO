package com

import com.database.service.StudentService
import com.database.connectToDatabase
import com.database.createTables
import com.database.table.Students
import io.ktor.server.application.*

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

    // Add new student
//    studentService.addStudent(
//        mail = "bialecki@example.com",
//        password = "marcinbialecki1",
//        name = "Marcin",
//        surname = "Białecki"
//    )
//    println("New student added.")

    // Delete student
    studentService.deleteStudent(3)
    println("Student deleted.")

    // All students printed
    println("All students:")
    studentService.getAllStudents().forEach { student ->
        println("ID: ${student[Students.id]}, Email: ${student[Students.mail]}, Password: ${student[Students.password]}," +
                "Name: ${student[Students.name]}, Surname: ${student[Students.surname]}")
    }
}
