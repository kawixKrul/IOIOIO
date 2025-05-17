package com.utils

import com.database.table.Sessions
import io.ktor.server.application.*
import io.ktor.server.plugins.*
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction
import java.time.LocalDateTime

fun ApplicationCall.currentUserId(): Int? {
    val sessionToken = request.cookies["session_token"] ?: return null
    val userAgent = request.headers["User-Agent"]
    val ipAddress = request.origin.remoteHost

    val session = transaction {
        Sessions
            .select { (Sessions.token eq sessionToken) and (Sessions.expiresAt greater LocalDateTime.now()) }
            .singleOrNull()
    } ?: return null

    // Only check userAgent/ip if stored in DB (null-safe equals)
    val sessionUserAgent = session[Sessions.userAgent]
    val sessionIpAddress = session[Sessions.ipAddress]

    if ((sessionUserAgent != null && sessionUserAgent != userAgent) ||
        (sessionIpAddress != null && sessionIpAddress != ipAddress)) {
        return null
    }

    return session[Sessions.userId].value
}
