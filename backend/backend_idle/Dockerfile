# Use a base image with Java 21 (or your desired Java version)
FROM openjdk:21-jdk-slim

# Set the working directory inside the container
WORKDIR /app

# Copy Gradle wrapper and configuration files first to leverage Docker layer caching
# These files change less frequently than source code
COPY gradlew .
COPY gradle gradle/
COPY build.gradle .
COPY settings.gradle .

# Give execution rights to the Gradle wrapper
RUN chmod +x gradlew

# Build dependencies and download them. This layer will be cached if build.gradle doesn't change.
# Use 'dependencies' task to only download dependencies without building the app.
# Or, if you want to build the app but skip tests, use 'bootJar -x test'.
# For faster builds, it's often better to just download dependencies here.
RUN ./gradlew dependencies

# Copy the source code. This will invalidate the cache for subsequent layers if source changes.
COPY src src/

# Build the Spring Boot application, skipping tests for faster Docker image builds.
# If you have critical unit tests that run during CI/CD, consider running them in a separate CI step
# or in a multi-stage build before this final stage.
RUN ./gradlew bootJar -x test

# Expose the port your Spring Boot application listens on (default is 8080)
EXPOSE 8080

# Command to run the application
# Find the JAR file dynamically and run it
ENTRYPOINT ["/bin/bash", "-c", "java -jar $(find build/libs -name '*.jar')"]