# Build stage
FROM maven:3.9.11-eclipse-temurin-25-alpine AS builder

WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B || true

COPY src ./src
RUN mvn clean package -DskipTests

# Production runtime stage
FROM eclipse-temurin:25-jre-alpine AS runner

WORKDIR /app

ENV SPRING_PROFILES_ACTIVE=prod
RUN apk --no-cache add curl tzdata

COPY --from=builder /app/target/user-service-*.jar ./app.jar

EXPOSE 5002

ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
CMD ["java", "-jar", "app.jar"]
