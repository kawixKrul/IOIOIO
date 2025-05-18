package com.utils

import kotlinx.serialization.Serializable

@Serializable
data class ThesisTopicRequest(
    val title: String,
    val description: String,
    val degreeLevel: String, // eg. "MSc", "BSc"
    val availableSlots: Int,
    val tags: List<String>
)