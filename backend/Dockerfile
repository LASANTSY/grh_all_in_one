# ============================================================
# GRH EMMN — Backend NestJS
# Build multi-stage : compilateur + runtime final leger
# ============================================================

# ============================================================
# ETAPE 1 : Dependances
# ============================================================
FROM node:20-alpine AS deps

WORKDIR /app

# Dependances systeme necessaires pour bcrypt (compilation native)
RUN apk add --no-cache python3 make g++

# Copier uniquement les fichiers de dependances pour profiter du cache
COPY package.json package-lock.json ./

# Installer TOUTES les dependances (y compris dev pour le build)
RUN npm ci --include=dev


# ============================================================
# ETAPE 2 : Build (compilation TypeScript)
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Dependances de l'etape 1
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src

# Compiler le TypeScript
RUN npm run build


# ============================================================
# ETAPE 3 : Dependances de production uniquement
# ============================================================
FROM node:20-alpine AS prod-deps

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./

# Installer uniquement les dependances de production
RUN npm ci --omit=dev && npm cache clean --force


# ============================================================
# ETAPE 4 : Image finale (legere)
# ============================================================
FROM node:20-alpine AS runner

WORKDIR /app

# Metadonnees
LABEL org.opencontainers.image.title="GRH EMMN Backend"
LABEL org.opencontainers.image.description="API REST NestJS pour la gestion RH de l'EMMN"

# Utilisateur non-root pour la securite
RUN addgroup -g 1001 -S nodejs && adduser -S -u 1001 -G nodejs nodejs

# Copier les dependances de production
COPY --from=prod-deps --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copier le code compile
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json

# Creer le dossier de stockage (sera monte en volume)
RUN mkdir -p /app/storage && chown -R nodejs:nodejs /app/storage

# Passer a l'utilisateur non-root
USER nodejs

# Exposer le port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/bases', (r) => process.exit(r.statusCode < 500 ? 0 : 1)).on('error', () => process.exit(1))"

# Commande par defaut (surchargee par docker-compose pour executer les migrations)
CMD ["node", "dist/main.js"]