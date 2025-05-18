package com.utils

import kotlinx.serialization.Serializable

@Serializable
data class UserRequest(
    val id: Int,
    val email: String,
    val name: String,
    val surname: String,
    val expertiseField: String? = null
)