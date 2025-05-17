package com.database.table

import org.jetbrains.exposed.dao.id.IntIdTable

object Students : IntIdTable("Student") {
    val userId = integer("user_id").references(Users.id)
    val mail = varchar("Mail", 30).uniqueIndex()
    val password = varchar("Password", 30)
    val name = varchar("Name", 30)
    val surname = varchar("Surname", 30)
    val idChosenTopic = integer("ID_chosen_topic").nullable()
}
