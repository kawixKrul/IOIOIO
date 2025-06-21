package com.database.table

import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.javatime.datetime

object Sessions : IntIdTable("sessions") {
    val userId = reference("user_id", Users)
    val token = varchar("token", 255).uniqueIndex()
    val createdAt = datetime("created_at")
    val expiresAt = datetime("expires_at")
    val userAgent = varchar("user_agent", 512).nullable() // optional, for security/tracking
    val ipAddress = varchar("ip_address", 256).nullable()  // optional, for security/tracking (IPv6 max length)
}