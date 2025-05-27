package com.database.table

import org.jetbrains.exposed.dao.id.IntIdTable

enum class ApplicationStatus(val code: Int) {
    PENDING(0),
    CONFIRMED(1),
    REJECTED(2),
    WITHDRAWN(3),
    COMPLETED(4);

    companion object {
        fun fromCode(code: Int): ApplicationStatus =
            entries.find { it.code == code }
                ?: throw IllegalArgumentException("Unknown status code: $code")
    }
}

object Applications : IntIdTable("Applications") {
    val studentId = reference("Student_ID", Students)
    val promoterId = reference("Promoter_ID", Supervisors)
    val topicId = reference("Topic_ID", ThesesTopics)
    val description = text("Description")
    /**
     * Status of application:
     * 0 = PENDING
     * 1 = CONFIRMED
     * 2 = REJECTED
     * 3 = WITHDRAWN
     * 4 = COMPLETED
     */
    val status = integer("Status")
    val confirmationToken = varchar("ConfirmationToken", 64).nullable()
}
