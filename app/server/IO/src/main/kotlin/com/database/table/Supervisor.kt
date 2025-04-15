package com.database.table

import org.jetbrains.exposed.dao.id.IntIdTable

object Supervisors : IntIdTable("Supervisors") {
    val mail = varchar("Mail", 30).uniqueIndex()
    val password = varchar("Password", 30)
    val name = varchar("Name", 30)
    val surname = varchar("Surname", 30)
    val expertiseField = varchar("Expertise_field", 250)
}
