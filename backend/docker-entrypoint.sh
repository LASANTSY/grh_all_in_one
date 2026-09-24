#!/bin/sh
set -e

echo "============================================"
echo " GRH EMMN - Backend"
echo "============================================"

echo ""
echo "[1/3] Attente de PostgreSQL..."
until node -e "
const net = require('net');
const s = net.createConnection(parseInt(process.env.DB_PORT || '5432'), process.env.DB_HOST || 'postgres');
s.on('connect', () => { s.end(); process.exit(0); });
s.on('error', () => { process.exit(1); });
" 2>/dev/null; do
  echo "  PostgreSQL non disponible, nouvelle tentative dans 2s..."
  sleep 2
done
echo "  PostgreSQL est pret."

echo ""
echo "[2/3] Execution des migrations..."
cd /app
npx typeorm migration:run -d dist/database/data-source.js || {
  echo "  Echec des migrations. Arret."
  exit 1
}

echo ""
echo "[3/3] Chargement des donnees de demonstration (idempotent)..."
node dist/database/seeds/seed.js || {
  echo "  Avertissement : le seed a echoue. Demarrage quand meme."
}

echo ""
echo "============================================"
echo " Demarrage du serveur NestJS..."
echo "============================================"
echo ""

exec "$@"