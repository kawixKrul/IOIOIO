val kotlin_version: String by project
val logback_version: String by project
val ktor_version = "2.3.10"

plugins {
    kotlin("jvm") version "2.1.20"
    id("io.ktor.plugin") version "3.1.2"
    id("com.gradleup.shadow") version "8.3.6"
    kotlin("plugin.serialization") version "2.1.20"
}

group = "com.example"
version = "0.0.1"

application {
    mainClass.set("io.ktor.server.netty.EngineMain")

    val isDevelopment: Boolean = project.ext.has("development")
    applicationDefaultJvmArgs = listOf("-Dio.ktor.development=$isDevelopment")
}

repositories {
    mavenCentral()
}

dependencies {
    implementation(kotlin("stdlib"))

    // Ktor Client Logging
    implementation("io.ktor:ktor-client-logging:2.4.0")

    // SLF4J Simple (Basic Logging)
    implementation("org.slf4j:slf4j-simple:2.0.9")

    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.8.1")


    implementation("at.favre.lib:bcrypt:0.10.2")
    implementation("io.ktor:ktor-server-core:$ktor_version")
    implementation("io.ktor:ktor-server-auth:$ktor_version")
    implementation("io.ktor:ktor-server-netty:$ktor_version")
    implementation("ch.qos.logback:logback-classic:$logback_version")
    implementation("io.ktor:ktor-server-config-yaml:$ktor_version")
    implementation("org.jetbrains.exposed:exposed-core:0.41.1")
    implementation("org.jetbrains.exposed:exposed-dao:0.41.1")
    implementation("org.jetbrains.exposed:exposed-jdbc:0.41.1")
    implementation("org.jetbrains.exposed:exposed-java-time:0.41.1")
    implementation("org.jetbrains.exposed:exposed-kotlin-datetime:0.41.1")
    implementation("org.postgresql:postgresql:42.7.2")
    implementation("io.github.cdimascio:dotenv-kotlin:6.4.1")

    implementation("io.ktor:ktor-server-auth:2.4.1")
    implementation("io.ktor:ktor-server-auth-jwt:2.4.1")
    implementation("io.ktor:ktor-server-sessions:2.4.1")
    implementation("io.ktor:ktor-server-content-negotiation:2.4.1")
    implementation("io.ktor:ktor-serialization-kotlinx-json:2.4.1")

    // Add these for Mailgun/email HTTP requests:
    implementation("io.ktor:ktor-client-core:$ktor_version")
    implementation("io.ktor:ktor-client-cio:$ktor_version")

    implementation("io.ktor:ktor-server-content-negotiation:$ktor_version")
    implementation("io.ktor:ktor-serialization-kotlinx-json:$ktor_version")
    implementation("io.ktor:ktor-client-content-negotiation:$ktor_version")

    testImplementation("io.ktor:ktor-server-test-host:$ktor_version")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit:$kotlin_version")
}

tasks.named<Jar>("shadowJar") {
    archiveBaseName.set("app")
    archiveClassifier.set("")
    archiveVersion.set("")
}
