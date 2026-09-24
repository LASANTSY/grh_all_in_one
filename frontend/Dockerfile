# ============================================================
# GRH EMMN — Frontend React + Vite
# Build multi-stage : compilateur + nginx (serveur statique)
# ============================================================

# ============================================================
# ETAPE 1 : Build de l'application React
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Arguments de build (injectes par docker-compose)
ARG VITE_API_URL=/api
ARG VITE_APP_NAME="GRH EMMN"
ARG VITE_APP_URL=http://localhost:8080

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_APP_NAME=${VITE_APP_NAME}
ENV VITE_APP_URL=${VITE_APP_URL}

# Copier les fichiers de dependances
COPY package.json package-lock.json ./

# Installer les dependances
RUN npm ci

# Copier le code source
COPY . .

# Compiler pour la production
RUN npm run build


# ============================================================
# ETAPE 2 : Serveur nginx (image finale legere)
# ============================================================
FROM nginx:1.27-alpine AS runner

LABEL org.opencontainers.image.title="GRH EMMN Frontend"
LABEL org.opencontainers.image.description="Interface React de gestion RH de l'EMMN"

# Supprimer la config nginx par defaut
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

# Copier la config nginx personnalisee
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers compiles
COPY --from=builder /app/dist /usr/share/nginx/html

# Exposer le port 80
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# nginx demarre automatiquement
CMD ["nginx", "-g", "daemon off;"]