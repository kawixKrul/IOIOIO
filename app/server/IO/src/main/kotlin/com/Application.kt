package com

import com.database.StudentService.addStudent
import com.database.connectToDatabase
import com.database.createTables
import io.ktor.server.application.*

fun main(args: Array<String>) {
    io.ktor.server.netty.EngineMain.main(args)
}

fun Application.module() {
    configureSecurity()
    configureRouting()

    connectToDatabase()

    createTables()
    println("Baza danych połączona i tabela stworzona.")

//    addStudent("Jan", "kowalski@gmail.com")
//    println("New record added to database")
}
