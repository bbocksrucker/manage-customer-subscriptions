# Verwende Node 18 auf Alpine-Basis
FROM node:18-alpine

# Installiere notwendige Pakete für Prisma und SQLite
RUN apk add --no-cache openssl sqlite libc6-compat python3 build-base

# Setze das Arbeitsverzeichnis
WORKDIR /app

# Kopiere die package-Dateien in das Image
COPY package*.json ./
COPY prisma ./prisma/

# Installiere Abhängigkeiten
RUN npm ci

# Generiere Prisma Client
RUN npx prisma generate

# Kopiere den Rest des Anwendungscodes
COPY . .

# Baue die Anwendung
RUN npm run build

# Setze die Umgebungsvariable für den Produktionsmodus
ENV NODE_ENV=production
ENV DATABASE_URL="file:/data/prod.db"

# Exponiere den Port
EXPOSE 3000

# Erstelle ein Startskript
RUN echo '#!/bin/sh' > /app/docker-start.sh && \
    echo 'npx prisma migrate deploy' >> /app/docker-start.sh && \
    echo 'npm run start' >> /app/docker-start.sh && \
    chmod +x /app/docker-start.sh

# Starte die Anwendung
CMD ["/app/docker-start.sh"]