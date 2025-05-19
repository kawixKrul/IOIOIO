# syntax=docker/dockerfile:1.4
####### build stage #######
FROM gradle:8.5-jdk17 AS build
WORKDIR /app

# 1) copy wrapper + build scripts + properties
COPY gradlew .
COPY gradle gradle
COPY build.gradle.kts settings.gradle.kts gradle.properties ./

# make the wrapper executable
RUN chmod +x gradlew

# 2) warm up Gradle (download wrapper, plugins, deps) into BuildKit cache
RUN --mount=type=cache,id=gradle-cache,target=/home/gradle/.gradle \
    ./gradlew dependencies --no-daemon

# 3) copy your application code
COPY src src

# 4) actual fat-jar build, re-using the same cache
RUN --mount=type=cache,id=gradle-cache,target=/home/gradle/.gradle \
    ./gradlew clean shadowJar --no-daemon

####### runtime stage #######
FROM openjdk:17-jdk-slim AS runtime
WORKDIR /app

# pull in only the JAR and your env file
COPY --from=build /app/build/libs/*.jar app.jar
COPY .env .env

CMD ["java","-jar","app.jar"]
