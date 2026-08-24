FROM maven:3.9.11-eclipse-temurin-25-alpine AS builder

WORKDIR /app
COPY pom.xml .
# Download dependencies for offline cache
RUN mvn dependency:go-offline

COPY src ./src
RUN mvn clean package -DskipTests

# Production image
FROM eclipse-temurin:25-jre-alpine AS runner
WORKDIR /app
ENV SPRING_PROFILES_ACTIVE=prod

COPY --from=builder /app/target/auth-service-*.jar ./app.jar

EXPOSE 5001
CMD ["java", "-jar", "app.jar"]