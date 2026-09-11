# Contexte de build attendu : dossier ./backend (acces au POM parent + common-libs).
# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
# On copie tout le multi-module : le POM parent reference les 3 modules et Maven
# doit pouvoir lire chacun pour construire le reacteur. Le -pl/-am ne COMPILE que
# common-libs + u2-blog ; le reste n'est pas construit.
COPY . .
RUN mvn -pl u2-blog -am clean package -DskipTests

# Stage 2: Run
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app
COPY --from=build /app/u2-blog/target/*.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
