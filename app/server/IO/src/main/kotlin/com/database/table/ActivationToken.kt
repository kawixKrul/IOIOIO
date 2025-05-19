// ActivationTokens.kt
package com.database.table

import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.javatime.datetime

object ActivationTokens : Table("activation_tokens") {
    val id = integer("id").autoIncrement()
    val userId = reference("user_id", Users.id).uniqueIndex()
    val token = varchar("token", 255).uniqueIndex()
    val expiresAt = datetime("expires_at")

    override val primaryKey = PrimaryKey(id)
}

