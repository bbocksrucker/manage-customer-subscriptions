# Verwende Node 18 auf Alpine-Basis
FROM node:18-alpine

# Installiere openssl (falls benötigt)
RUN apk add --no-cache openssl

# Setze das Arbeitsverzeichnis
WORKDIR /app

# Setze die Umgebungsvariable für den Produktionsmodus
ENV NODE_ENV=production

# Kopiere die package-Dateien in das Image
COPY package.json package-lock.json* ./

# Installiere nur Produktionsabhängigkeiten und bereinige den npm-Cache
RUN npm ci --omit=dev && npm cache clean --force

# Entferne optional CLI-Pakete, die in der Produktion nicht benötigt werden
RUN npm remove @shopify/cli

# Kopiere den Rest des Anwendungscodes
COPY . .

# Baue die Anwendung
RUN npm run build

# Exponiere den Port, den die App nutzt (hier Port 3000)
EXPOSE 3000

# Starte die Anwendung
CMD ["npm", "run", "docker-start"]