# Stage 1: Build
FROM node:24-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

# Stage 2: Serve
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
# On copie depuis le dossier de build Angular 21
COPY --from=build /app/dist/citatio-front/browser /usr/share/nginx/html
EXPOSE 80