# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build

# Cache dependency resolution separately from source compilation
COPY pom.xml .
RUN mvn dependency:go-offline -q

COPY src ./src
RUN mvn package -DskipTests -q

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-jammy AS runtime

# Install Tesseract OCR + English language data for tess4j fallback
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-eng \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Non-root user for security
RUN groupadd --gid 1001 spring && \
    useradd --uid 1001 --gid spring --shell /bin/bash --create-home spring

COPY --from=build /build/target/*.jar app.jar
RUN chown spring:spring app.jar && \
    mkdir -p /app/uploads && \
    chown spring:spring /app/uploads

USER spring

EXPOSE 8080

ENV TESSDATA_PREFIX=/usr/share/tesseract-ocr/5/tessdata

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
