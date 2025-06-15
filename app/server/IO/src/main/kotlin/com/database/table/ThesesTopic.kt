package com.database.table

import org.jetbrains.exposed.dao.id.IntIdTable

object ThesesTopics : IntIdTable("Theses_topics") {
    val promoterId = reference("Promoter_ID", Supervisors)
    val title = varchar("Title", 100)
    val description = varchar("Description", 250)
    val degreeLevel = varchar("Degree_level", 50)  // eg. "MSc", "BSc"
    val availableSlots = integer("Available_slots")
    val tagsList = text("Tags_list")
}
