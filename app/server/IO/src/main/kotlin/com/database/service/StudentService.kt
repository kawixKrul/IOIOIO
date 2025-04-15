package com.database.service

import com.database.table.Students
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq


class StudentService {
    fun addStudent(mail: String, password: String, name: String, surname: String, topicId: Int? = null): Int {
        return transaction {
            Students.insertAndGetId {
                it[Students.mail] = mail
                it[Students.password] = password
                it[Students.name] = name
                it[Students.surname] = surname
                it[Students.idChosenTopic] = topicId
            }.value
        }
    }

    fun deleteStudent(id: Int) {
        transaction {
            Students.deleteWhere { Students.id eq id }
        }
    }

    fun getAllStudents(): List<ResultRow> = transaction {
        Students.selectAll().toList()
    }

    fun getStudentById(id: Int): ResultRow? = transaction {
        Students.select { Students.id eq id }.singleOrNull()
    }
}
