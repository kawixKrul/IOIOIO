package com.database.table

import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.ReferenceOption

object Admins : IntIdTable("admins") {
    val userId = reference(
        name = "user_id",
        foreign = Users,
        onDelete = ReferenceOption.CASCADE
    ).uniqueIndex()
}
