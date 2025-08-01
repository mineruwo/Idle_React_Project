
# Use a base image with Java 17 (or your desired Java version)
FROM openjdk:17-jdk-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the Gradle wrapper and build files
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# Copy the source code
COPY src src

# Give execution rights to the Gradle wrapper
RUN chmod +x gradlew

# Build the Spring Boot application
# This will create the JAR file in build/libs/
RUN ./gradlew bootJar
RUN ls -l build/libs/
RUN ls -l /app

# Expose the port your Spring Boot application listens on (default is 8080)
EXPOSE 8080

# Command to run the application
# Replace 'backend_idle-0.0.1-SNAPSHOT.jar' with your actual JAR file name
# You can find the exact JAR name in your build/libs/ directory after a successful local build.
ENTRYPOINT ["java", "-jar", "build/libs/backend_idle-0.0.1-SNAPSHOT.jar"]
