package com.database.table

import org.jetbrains.exposed.dao.id.IntIdTable

object Applications : IntIdTable("Applications") {
    val studentId = reference("Student_ID", Students)
    val promoterId = reference("Promoter_ID", Supervisors)
    val topicId = reference("Topic_ID", ThesesTopics)
    val description = text("Description")
    val status = integer("Status")
    val confirmationToken = varchar("ConfirmationToken", 64).nullable()
}
