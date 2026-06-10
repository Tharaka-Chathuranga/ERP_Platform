# syntax=docker/dockerfile:1
# ──────────────────────────────────────────────────────────────────────────────
# Multi-stage build that produces ONE image serving both the React SPA and the
# Spring Boot API on a single origin (port 8080). The SPA calls the API via the
# relative "/api" base URL, so bundling the built frontend into the jar's static
# resources means no CORS, no second container, no reverse proxy.
#
#   Stage 1 (frontend) : node build  -> frontend/dist
#   Stage 2 (backend)  : gradle build, with the SPA copied into static/ -> jar
#   Stage 3 (runtime)  : slim JRE running the fat jar
# ──────────────────────────────────────────────────────────────────────────────

# ── Stage 1: build the React SPA ──────────────────────────────────────────────
FROM node:22-alpine AS frontend
WORKDIR /frontend
# Install deps against the lockfile first for better layer caching.
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build          # -> /frontend/dist

# ── Stage 2: build the Spring Boot jar (with SPA bundled in) ───────────────────
FROM eclipse-temurin:21-jdk AS backend
WORKDIR /src
# Copy the Gradle wrapper + build scripts first so dependency resolution caches.
COPY backend/gradlew backend/settings.gradle.kts backend/build.gradle.kts backend/gradle.properties ./backend/
COPY backend/gradle ./backend/gradle
# Warm the dependency cache (best-effort; ignore failure when offline).
WORKDIR /src/backend
RUN ./gradlew --no-daemon help >/dev/null 2>&1 || true
# Now the full source.
WORKDIR /src
COPY backend ./backend
# Drop the built SPA into the bootstrap module's static resources so bootJar
# packages it inside erp-platform.jar (served from classpath:/static/).
COPY --from=frontend /frontend/dist/ ./backend/bootstrap/src/main/resources/static/
WORKDIR /src/backend
RUN ./gradlew --no-daemon :bootstrap:bootJar

# ── Stage 3: minimal runtime ──────────────────────────────────────────────────
FROM eclipse-temurin:21-jre AS runtime
WORKDIR /app
# Run as a non-root user.
RUN groupadd --system app && useradd --system --gid app --home /app app
COPY --from=backend /src/backend/bootstrap/build/libs/erp-platform.jar app.jar
RUN chown -R app:app /app
USER app

ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0"
EXPOSE 8080

# Container-level health check hits the public actuator endpoint.
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -q -O /dev/null http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
