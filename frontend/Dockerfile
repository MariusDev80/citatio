# Stage 1: Build
FROM node:26-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

# Stage 2: Serve
FROM nginx:1.28-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
# On copie depuis le dossier de build Angular 21
COPY --from=build /app/dist/citatio-front/browser /usr/share/nginx/html
EXPOSE 80