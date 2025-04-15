package com.database.table

import org.jetbrains.exposed.dao.id.IntIdTable

object Admins : IntIdTable("Admin") {
    val mail = varchar("Mail", 30).uniqueIndex()
    val password = varchar("Password", 30)
}
