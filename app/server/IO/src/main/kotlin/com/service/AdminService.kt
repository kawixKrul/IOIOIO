package com.service

import com.repository.AdminRepository

class AdminService(private val repo: AdminRepository) {
    fun getAllStudents() = repo.getAllStudents()
    fun getAllSupervisors() = repo.getAllSupervisors()
}
