package com.database.table

import org.jetbrains.exposed.dao.id.IntIdTable

object Tags : IntIdTable("Tags") {
    val name = varchar("Name", 30)
    val thesisId = reference("Thesis_ID", Theses).nullable()
    val topicId = reference("Topic_ID", ThesesTopics).nullable()
}
