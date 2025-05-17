// ActivationTokens.kt
package com.database.table

import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.javatime.datetime

object ActivationTokens : Table() {
    val id = integer("id").autoIncrement()
    val userId = integer("user_id").references(Users.id)
    val token = varchar("token", 255).uniqueIndex()
    val expiresAt = datetime("expires_at")
    override val primaryKey = PrimaryKey(id)
}
