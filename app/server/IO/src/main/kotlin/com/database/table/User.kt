package com.database.table

import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.javatime.datetime

object Users : IntIdTable("users") {
    val email = varchar("email", 255).uniqueIndex()
    val passwordHash = varchar("password_hash", 255)
    val isActive = bool("is_active").default(false)
    val createdAt = datetime("created_at")
    val role = varchar("role", 50) // e.g. "student", "supervisor", "admin"
    val name = varchar("name", 50)
    val surname = varchar("surname", 50)
}
