package com.database.table

import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.javatime.datetime

object Users : Table() {
    val id = integer("id").autoIncrement()
    val email = varchar("email", 255).uniqueIndex()
    val passwordHash = varchar("password_hash", 255)
    val isActive = bool("is_active").default(false)
    val createdAt = datetime("created_at")
    val role = varchar("role", 50) // e.g. "student", "admin"
    override val primaryKey = PrimaryKey(id)
}
