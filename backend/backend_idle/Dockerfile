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

# Build the Spring Boot application, skipping tests for faster Docker image builds.
# This command will also download dependencies as part of the build process.
RUN ./gradlew bootJar -x test

# Add this line to check if the JAR is created (for debugging, can be removed later)
RUN ls -l build/libs/

# Expose the port your Spring Boot application listens on (default is 8080)
EXPOSE 8080

# Command to run the application
# Find the JAR file dynamically and run it
ENTRYPOINT ["/bin/bash", "-c", "java -jar $(find build/libs -name '*.jar')"]