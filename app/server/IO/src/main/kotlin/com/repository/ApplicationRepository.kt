package com.repository

import com.database.table.ApplicationStatus
import com.database.table.Applications
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update

class ApplicationRepository {

    fun updateApplicationStatus(
        applicationId: Int,
        newStatus: String
    ) = transaction {
        Applications.update({ Applications.id eq applicationId }) {
            it[status] = ApplicationStatus.valueOf(newStatus).code
        }
    }

    fun findById(applicationId: Int) = transaction {
        Applications.select { Applications.id eq applicationId }
            .singleOrNull()
    }
}
