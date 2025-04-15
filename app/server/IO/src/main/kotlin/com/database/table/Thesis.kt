package com.database.table

import org.jetbrains.exposed.dao.id.IntIdTable

object Theses : IntIdTable("Theses") {
    val title = varchar("Title", 50)
    val author = varchar("Author", 30)
    val description = varchar("Description", 250)
    val pdf = text("PDF")
    val tagsList = text("Tags_list")
    val supervisorId = reference("Supervisor_ID", Supervisors)
}
