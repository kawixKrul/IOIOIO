package com.database.table

import com.database.table.Students.references
import org.jetbrains.exposed.dao.id.IntIdTable

object Supervisors : IntIdTable("Supervisors") {
    val userId = integer("user_id").references(Users.id)
    val mail = varchar("Mail", 30).uniqueIndex()
    val password = varchar("Password", 30)
    val name = varchar("Name", 30)
    val surname = varchar("Surname", 30)
    val expertiseField = varchar("Expertise_field", 250)
}
