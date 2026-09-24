# ============================================================
# GRH EMMN — Script de demarrage Docker
# ============================================================
# Usage :
#   .\start.ps1              -> Demarre l'application
#   .\start.ps1 -Rebuild     -> Reconstruit les images puis demarre
#   .\start.ps1 -Reset       -> Supprime tout (volumes compris) puis demarre
#   .\start.ps1 -Logs        -> Affiche les logs en temps reel
#   .\start.ps1 -Stop        -> Arrete l'application
# ============================================================

param(
    [switch]$Rebuild,
    [switch]$Reset,
    [switch]$Logs,
    [switch]$Stop
)

$ErrorActionPreference = "Stop"

function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Success($msg) { Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }

# Verification de Docker
$dockerCheck = docker --version 2>$null
if (-not $dockerCheck) {
    Write-Host "[ERREUR] Docker n'est pas installe ou n'est pas dans le PATH." -ForegroundColor Red
    exit 1
}

$composeCheck = docker compose version 2>$null
if (-not $composeCheck) {
    Write-Host "[ERREUR] Docker Compose n'est pas disponible." -ForegroundColor Red
    exit 1
}

# Fichier .env
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.docker") {
        Write-Info "Creation de .env a partir de .env.docker..."
        Copy-Item ".env.docker" ".env"
        Write-Warn "Editez .env pour changer les secrets JWT avant la production."
    } else {
        Write-Warn "Fichier .env absent. Utilisation des valeurs par defaut."
    }
}

# --- Arret ---
if ($Stop) {
    Write-Info "Arret des containers..."
    docker compose down
    Write-Success "Application arretee."
    exit 0
}

# --- Reset ---
if ($Reset) {
    Write-Warn "Suppression des containers ET des volumes (donnees perdues)..."
    $confirm = Read-Host "Confirmer ? (oui/non)"
    if ($confirm -ne "oui") {
        Write-Info "Annule."
        exit 0
    }
    docker compose down -v
    Write-Success "Reset termine."
}

# --- Logs ---
if ($Logs) {
    Write-Info "Affichage des logs (Ctrl+C pour quitter)..."
    docker compose logs -f
    exit 0
}

# --- Demarrage ---
Write-Info "Demarrage de GRH EMMN..."

if ($Rebuild) {
    Write-Info "Reconstruction des images..."
    docker compose build --no-cache
}

docker compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERREUR] Echec du demarrage." -ForegroundColor Red
    exit 1
}

# Attente que le frontend reponde
Write-Info "Attente du demarrage complet (30s max)..."
$maxAttempts = 30
$attempt = 0
$ready = $false

while ($attempt -lt $maxAttempts -and -not $ready) {
    Start-Sleep -Seconds 1
    $attempt++
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) { $ready = $true }
    } catch {
        Write-Host "." -NoNewline
    }
}

Write-Host ""

if ($ready) {
    Write-Success "Application prete !"
    Write-Host ""
    Write-Host "  Interface  : http://localhost:8080" -ForegroundColor Cyan
    Write-Host "  API directe : http://localhost:3000/api" -ForegroundColor Cyan
    Write-Host "  Swagger    : http://localhost:3000/api/docs" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Comptes de demonstration :" -ForegroundColor Yellow
    Write-Host "    admin       / Admin@2024!"
    Write-Host "    rh.emmn     / RhEmmn@2024!"
    Write-Host "    rh.bana     / RhBana@2024!"
    Write-Host "    chef.bana   / ChefBana@2024!"
    Write-Host ""
    Write-Host "  Logs : .\start.ps1 -Logs" -ForegroundColor Gray
    Write-Host "  Arret : .\start.ps1 -Stop" -ForegroundColor Gray
} else {
    Write-Warn "L'application n'a pas repondu dans le delai. Verifiez les logs :"
    Write-Host "  docker compose logs" -ForegroundColor Gray
}