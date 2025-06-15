package com.repository

import com.database.table.*
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction

data class UserDto(
    val id: Int,
    val email: String,
    val name: String,
    val surname: String,
    val expertiseField: String? = null
)

class AdminRepository {
    fun getAllStudents(): List<UserDto> = transaction {
        (Students innerJoin Users)
            .select { Users.role eq "student" }
            .map {
                UserDto(
                    id = it[Users.id].value,
                    email = it[Users.email],
                    name = it[Users.name],
                    surname = it[Users.surname]
                )
            }
    }

    fun getAllSupervisors(): List<UserDto> = transaction {
        (Supervisors innerJoin Users)
            .select { Users.role eq "supervisor" }
            .map {
                UserDto(
                    id = it[Users.id].value,
                    email = it[Users.email],
                    name = it[Users.name],
                    surname = it[Users.surname],
                    expertiseField = it[Supervisors.expertiseField]
                )
            }
    }
}
