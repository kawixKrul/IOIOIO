package com.database.table

import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.ReferenceOption

object Students : IntIdTable("students") {
    val userId = reference(
        name = "user_id",
        foreign = Users,
        onDelete = ReferenceOption.CASCADE
    ).uniqueIndex()
    val chosenTopicId = integer("id_chosen_topic").nullable()
}
