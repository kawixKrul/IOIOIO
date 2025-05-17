package com.database.table

import com.database.table.Students.references
import org.jetbrains.exposed.dao.id.IntIdTable

object Admins : IntIdTable("Admin") {
    val userId = integer("user_id").references(Users.id)
    val mail = varchar("Mail", 30).uniqueIndex()
    val password = varchar("Password", 30)
}
