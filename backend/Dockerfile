# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21-alpine AS build
ARG MODULE_NAME=u1-communication
WORKDIR /app

COPY . .
RUN mvn -pl ${MODULE_NAME} -am clean package -DskipTests

# Stage 2: Run
FROM eclipse-temurin:21-jre-alpine
ARG MODULE_NAME=u1-communication
WORKDIR /app

COPY --from=build /app/${MODULE_NAME}/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]