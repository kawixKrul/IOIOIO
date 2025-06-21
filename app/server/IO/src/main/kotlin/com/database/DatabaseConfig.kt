package com.database

import com.database.table.*
import com.hashPassword
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.SchemaUtils
import io.github.cdimascio.dotenv.dotenv
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.insertAndGetId
import org.jetbrains.exposed.sql.select
import java.time.LocalDateTime

fun connectToDatabase() {
    val dotenv = dotenv()
    val databaseUrl = dotenv["DB_URL"] ?: error("DB_URL not set")
    val databaseUser = dotenv["DB_USER"] ?: error("DB_USER not set")
    val databasePassword = dotenv["DB_PASSWORD"] ?: error("DB_PASSWORD not set")

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
        SchemaUtils.createMissingTablesAndColumns(
            Users,
            ActivationTokens,
            Students,
            Admins,
            Applications,
            Tags,
            Theses,
            ThesesTopics,
            Supervisors,
            Sessions
        )
    }
}

fun alterTables() {
    transaction {
        try {
            exec("ALTER TABLE IF EXISTS sessions ALTER COLUMN ip_address TYPE VARCHAR(256)")
            
            println("Tables altered successfully")
        } catch (e: Exception) {
            println("Error altering tables: ${e.message}")
        }
    }
}

fun createInitialAdmin() {
    transaction {
        val hasAdmin = Users.select { Users.role eq "admin" }.count() > 0
        if (!hasAdmin) {
            val adminUserId = Users.insertAndGetId {
                it[email] = "admin@agh.edu.pl"
                it[passwordHash] = hashPassword("admin123")
                it[role] = "admin"
                it[name] = "Super"
                it[surname] = "Admin"
                it[createdAt] = LocalDateTime.now()
                it[isActive] = true
            }.value

            Admins.insert {
                it[userId] = adminUserId
            }

            println("Initial admin created.")
        }

        val hasSupervisor = Users.select { Users.role eq "supervisor" }.count() > 0
        if (hasSupervisor) {
            val supervisorUserId = Users.insertAndGetId {
                it[email] = "supervisor@agh.edu.pl"
                it[passwordHash] = hashPassword("supervisor123")
                it[role] = "supervisor"
                it[name] = "John"
                it[surname] = "Smith"
                it[createdAt] = LocalDateTime.now()
                it[isActive] = true
            }.value

            Supervisors.insert {
                it[userId] = supervisorUserId
                it[expertiseField] = "Machine Learning"
            }
            println("Sample supervisor created.")
        }

        val hasStudent = Users.select { Users.role eq "student" }.count() > 0
        if (hasStudent) {
            val studentUserId = Users.insertAndGetId {
                it[email] = "student@agh.edu.pl"
                it[passwordHash] = hashPassword("student123")
                it[role] = "student"
                it[name] = "Alice"
                it[surname] = "Johnson"
                it[createdAt] = LocalDateTime.now()
                it[isActive] = true
            }.value

            Students.insert {
                it[userId] = studentUserId
            }
            println("Sample student created.")
        }
    }
}


