package com.database

import com.database.table.*
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.SchemaUtils
import io.github.cdimascio.dotenv.dotenv

fun connectToDatabase() {
    // Konfiguracja bazy
//    val databaseUrl = System.getenv("DB_URL") ?: "jdbc:postgresql://localhost:5432/moja_baza"
//    val databaseUser = System.getenv("DB_USER") ?: "wiktor"
//    val databasePassword = System.getenv("DB_PASSWORD") ?: "tajnehaslo"

    val dotenv = dotenv()

    val databaseUrl = dotenv["DB_URL"] ?: "jdbc:postgresql://localhost:5432/moja_baza"
    val databaseUser = dotenv["DB_USER"] ?: "wiktor"
    val databasePassword = dotenv["DB_PASSWORD"] ?: "tajnehaslo"

    // Łączenie z bazą
    Database.connect(
        url = databaseUrl,
        driver = "org.postgresql.Driver",
        user = databaseUser,
        password = databasePassword
    )
}

fun <T> dbTransaction(block: () -> T): T {
    return transaction { block() }
}

fun createTables() {
    transaction {
        SchemaUtils.create(Students)
        SchemaUtils.create(Admins)
        SchemaUtils.create(Applications)
        SchemaUtils.create(Tags)
        SchemaUtils.create(Theses)
        SchemaUtils.create(ThesesTopics)
        SchemaUtils.create(Supervisors)
    }
}
