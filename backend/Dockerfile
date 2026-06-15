# ──────────────────────────────────────────────────────────────
# Multi-stage Dockerfile for Railfan Archive Manager Backend
# Compatible with Render (detects Dockerfile automatically)
# ──────────────────────────────────────────────────────────────

# Stage 1: Build with Maven
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Cache dependencies layer separately for faster rebuilds
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Build the application
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Lean runtime image
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

# Security: run as non-root
RUN addgroup -S railfan && adduser -S railfan -G railfan
USER railfan

# Copy built JAR
COPY --from=builder /app/target/*.jar app.jar

# Render sets $PORT dynamically — Spring Boot reads it via server.port=${PORT:8080}
EXPOSE 8080

# Health check for Render
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-8080}/actuator/health || exit 1

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
