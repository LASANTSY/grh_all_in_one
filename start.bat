@echo off
REM ============================================================
REM GRH EMMN - Script de lancement Docker (Windows)
REM ============================================================
REM
REM Usage :
REM   start.bat              Demarre l'application
REM   start.bat rebuild      Reconstruit les images puis demarre
REM   start.bat reset        Supprime tout (volumes compris) puis demarre
REM   start.bat logs         Affiche les logs en temps reel
REM   start.bat stop         Arrete l'application
REM   start.bat restart      Redemarre l'application
REM   start.bat status       Affiche l'etat des containers
REM   start.bat shell        Ouvre un shell dans le backend
REM   start.bat psql         Ouvre psql dans le container PostgreSQL
REM   start.bat backup       Sauvegarde la base de donnees
REM   start.bat help         Affiche cette aide
REM
REM ============================================================

setlocal EnableDelayedExpansion

REM --- Se placer dans le dossier du script ---
cd /d "%~dp0"

REM --- Titre de la fenetre ---
title GRH EMMN - Docker

REM --- Couleurs (codes ANSI) ---
for /F "tokens=1,2 delims=#" %%a in ('"prompt #$H#$E# & echo on & for %%b in (1) do rem"') do (
    set "ESC=%%b"
)
set "COLOR_INFO=%ESC%[36m"
set "COLOR_OK=%ESC%[32m"
set "COLOR_WARN=%ESC%[33m"
set "COLOR_ERR=%ESC%[31m"
set "COLOR_RESET=%ESC%[0m"

REM ============================================================
REM VERIFICATIONS PREALABLES
REM ============================================================

REM Verifier que Docker est installe
where docker >nul 2>nul
if errorlevel 1 (
    echo %COLOR_ERR%[ERREUR] Docker n'est pas installe ou n'est pas dans le PATH.%COLOR_RESET%
    echo.
    echo Telechargez et installez Docker Desktop : https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Verifier que Docker est en cours d'execution
docker info >nul 2>nul
if errorlevel 1 (
    echo %COLOR_ERR%[ERREUR] Docker Desktop n'est pas demarre.%COLOR_RESET%
    echo.
    echo Lancez Docker Desktop puis relancez ce script.
    pause
    exit /b 1
)

REM Verifier que docker compose est disponible
docker compose version >nul 2>nul
if errorlevel 1 (
    echo %COLOR_ERR%[ERREUR] Docker Compose n'est pas disponible.%COLOR_RESET%
    echo.
    echo Mettez a jour Docker Desktop vers une version recente.
    pause
    exit /b 1
)

REM Verifier que docker-compose.yml existe
if not exist "docker-compose.yml" (
    echo %COLOR_ERR%[ERREUR] Fichier docker-compose.yml introuvable.%COLOR_RESET%
    echo.
    echo Assurez-vous que ce script est a la racine du projet.
    pause
    exit /b 1
)

REM ============================================================
REM COMMANDE
REM ============================================================

set "COMMAND=%~1"

if "%COMMAND%"=="" goto :start
if /I "%COMMAND%"=="start" goto :start
if /I "%COMMAND%"=="up" goto :start
if /I "%COMMAND%"=="rebuild" goto :rebuild
if /I "%COMMAND%"=="reset" goto :reset
if /I "%COMMAND%"=="logs" goto :logs
if /I "%COMMAND%"=="stop" goto :stop
if /I "%COMMAND%"=="down" goto :stop
if /I "%COMMAND%"=="restart" goto :restart
if /I "%COMMAND%"=="status" goto :status
if /I "%COMMAND%"=="ps" goto :status
if /I "%COMMAND%"=="shell" goto :shell
if /I "%COMMAND%"=="psql" goto :psql
if /I "%COMMAND%"=="backup" goto :backup
if /I "%COMMAND%"=="help" goto :help
if /I "%COMMAND%"=="--help" goto :help
if /I "%COMMAND%"=="-h" goto :help

echo %COLOR_WARN%Commande inconnue : %COMMAND%%COLOR_RESET%
echo.
goto :help

REM ============================================================
REM DEMARRAGE NORMAL
REM ============================================================
:start
echo.
echo %COLOR_INFO%========================================%COLOR_RESET%
echo %COLOR_INFO%  GRH EMMN - Demarrage%COLOR_RESET%
echo %COLOR_INFO%========================================%COLOR_RESET%
echo.

REM Creer .env si absent
if not exist ".env" (
    if exist ".env.docker" (
        echo %COLOR_INFO%[INFO] Creation de .env a partir de .env.docker...%COLOR_RESET%
        copy /Y ".env.docker" ".env" >nul
        echo %COLOR_WARN%[WARN] Editez .env pour changer les secrets JWT avant la production.%COLOR_RESET%
    ) else (
        echo %COLOR_WARN%[WARN] Fichier .env absent. Utilisation des valeurs par defaut.%COLOR_RESET%
    )
)

echo %COLOR_INFO%[INFO] Demarrage des containers...%COLOR_RESET%
docker compose up -d

if errorlevel 1 (
    echo.
    echo %COLOR_ERR%[ERREUR] Echec du demarrage.%COLOR_RESET%
    echo.
    echo Consultez les logs : start.bat logs
    pause
    exit /b 1
)

echo.
echo %COLOR_INFO%[INFO] Attente du demarrage complet (30s max)...%COLOR_RESET%

REM Attente de disponibilite du frontend
set /a ATTEMPT=0
set "READY="
:wait_loop
set /a ATTEMPT+=1
if !ATTEMPT! GTR 30 goto :wait_done

REM Utiliser curl (present sur Windows 10+) ou PowerShell pour tester
curl -s -o nul -w "%%{http_code}" http://localhost:8080/health > "%TEMP%\grh_health.txt" 2>nul
set /p HTTP_CODE=<"%TEMP%\grh_health.txt"
del "%TEMP%\grh_health.txt" >nul 2>nul

if "!HTTP_CODE!"=="200" (
    set "READY=1"
    goto :wait_done
)

<nul set /p "."
timeout /t 1 /nobreak >nul
goto :wait_loop

:wait_done
echo.
echo.

if defined READY (
    echo %COLOR_OK%========================================%COLOR_RESET%
    echo %COLOR_OK%  Application prete !%COLOR_RESET%
    echo %COLOR_OK%========================================%COLOR_RESET%
    echo.
    echo   Interface  : %COLOR_INFO%http://localhost:8080%COLOR_RESET%
    echo   API        : %COLOR_INFO%http://localhost:3000/api%COLOR_RESET%
    echo   Swagger    : %COLOR_INFO%http://localhost:3000/api/docs%COLOR_RESET%
    echo.
    echo   Comptes de demonstration :
    echo     admin       / Admin@2024!
    echo     rh.emmn     / RhEmmn@2024!
    echo     rh.bana     / RhBana@2024!
    echo     chef.bana   / ChefBana@2024!
    echo.
    echo   Logs  : start.bat logs
    echo   Arret : start.bat stop
    echo.

    REM Ouvrir le navigateur
    choice /C ON /N /M "Ouvrir l'interface dans le navigateur ? [O/N] "
    if errorlevel 2 goto :end
    start http://localhost:8080
    goto :end
) else (
    echo %COLOR_WARN%[WARN] L'application n'a pas repondu dans le delai.%COLOR_RESET%
    echo.
    echo Verifiez les logs : start.bat logs
    echo.
    pause
)

goto :end

REM ============================================================
REM RECONSTRUCTION
REM ============================================================
:rebuild
echo.
echo %COLOR_INFO%========================================%COLOR_RESET%
echo %COLOR_INFO%  GRH EMMN - Reconstruction%COLOR_RESET%
echo %COLOR_INFO%========================================%COLOR_RESET%
echo.

if not exist ".env" (
    if exist ".env.docker" (
        echo %COLOR_INFO%[INFO] Creation de .env a partir de .env.docker...%COLOR_RESET%
        copy /Y ".env.docker" ".env" >nul
    )
)

echo %COLOR_INFO%[INFO] Reconstruction des images (peut prendre plusieurs minutes)...%COLOR_RESET%
docker compose build --no-cache

if errorlevel 1 (
    echo.
    echo %COLOR_ERR%[ERREUR] Echec de la reconstruction.%COLOR_RESET%
    pause
    exit /b 1
)

echo.
echo %COLOR_INFO%[INFO] Demarrage des containers...%COLOR_RESET%
docker compose up -d

if errorlevel 1 (
    echo %COLOR_ERR%[ERREUR] Echec du demarrage.%COLOR_RESET%
    pause
    exit /b 1
)

echo.
echo %COLOR_OK%[OK] Application reconstruite et demarree.%COLOR_RESET%
echo.
echo   Interface : http://localhost:8080
echo   Logs      : start.bat logs
echo.

choice /C ON /N /M "Ouvrir l'interface dans le navigateur ? [O/N] "
if errorlevel 2 goto :end
start http://localhost:8080

goto :end

REM ============================================================
REM RESET COMPLET
REM ============================================================
:reset
echo.
echo %COLOR_WARN%========================================%COLOR_RESET%
echo %COLOR_WARN%  GRH EMMN - Reset complet%COLOR_RESET%
echo %COLOR_WARN%========================================%COLOR_RESET%
echo.
echo %COLOR_WARN%ATTENTION : Toutes les donnees (base + fichiers) seront SUPPRIMEES.%COLOR_RESET%
echo.

choice /C ON /N /M "Confirmer le reset ? [O/N] "
if errorlevel 2 (
    echo Annule.
    goto :end
)

echo.
echo %COLOR_INFO%[INFO] Arret et suppression des containers et volumes...%COLOR_RESET%
docker compose down -v

if errorlevel 1 (
    echo %COLOR_ERR%[ERREUR] Echec de l'arret.%COLOR_RESET%
    pause
    exit /b 1
)

echo %COLOR_OK%[OK] Reset termine.%COLOR_RESET%
echo.

choice /C ON /N /M "Redemarrer maintenant ? [O/N] "
if errorlevel 2 goto :end
goto :rebuild

REM ============================================================
REM LOGS
REM ============================================================
:logs
echo.
echo %COLOR_INFO%[INFO] Affichage des logs (Ctrl+C pour quitter)...%COLOR_RESET%
echo.
docker compose logs -f
goto :end

REM ============================================================
REM ARRET
REM ============================================================
:stop
echo.
echo %COLOR_INFO%[INFO] Arret des containers...%COLOR_RESET%
docker compose down

if errorlevel 1 (
    echo %COLOR_ERR%[ERREUR] Echec de l'arret.%COLOR_RESET%
    pause
    exit /b 1
)

echo %COLOR_OK%[OK] Application arretee.%COLOR_RESET%
echo.
echo   Note : les donnees (volumes) sont conservees.
echo   Pour tout supprimer : start.bat reset
echo.
goto :end

REM ============================================================
REM REDEMARRAGE
REM ============================================================
:restart
echo.
echo %COLOR_INFO%[INFO] Redemarrage des containers...%COLOR_RESET%
docker compose restart

if errorlevel 1 (
    echo %COLOR_ERR%[ERREUR] Echec du redemarrage.%COLOR_RESET%
    pause
    exit /b 1
)

echo %COLOR_OK%[OK] Application redemarree.%COLOR_RESET%
echo.
goto :end

REM ============================================================
REM ETAT DES CONTAINERS
REM ============================================================
:status
echo.
echo %COLOR_INFO%[INFO] Etat des containers :%COLOR_RESET%
echo.
docker compose ps
echo.
goto :end

REM ============================================================
REM SHELL BACKEND
REM ============================================================
:shell
echo.
echo %COLOR_INFO%[INFO] Ouverture d'un shell dans le backend...%COLOR_RESET%
echo %COLOR_INFO%[INFO] Tapez 'exit' pour quitter.%COLOR_RESET%
echo.
docker compose exec backend sh
goto :end

REM ============================================================
REM PSQL
REM ============================================================
:psql
echo.
echo %COLOR_INFO%[INFO] Connexion a PostgreSQL...%COLOR_RESET%
echo %COLOR_INFO%[INFO] Tapez '\q' pour quitter.%COLOR_RESET%
echo.
docker compose exec postgres psql -U postgres -d grh_emmn
goto :end

REM ============================================================
REM BACKUP BASE DE DONNEES
REM ============================================================
:backup
echo.
echo %COLOR_INFO%[INFO] Sauvegarde de la base de donnees...%COLOR_RESET%

REM Creer le dossier backups si absent
if not exist "backups" mkdir backups

REM Nom du fichier avec date/heure
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (
    set "DATE=%%c%%a%%b"
)
for /f "tokens=1-2 delims=: " %%a in ('time /t') do (
    set "TIME=%%a%%b"
)
set "TIMESTAMP=!DATE!_!TIME!"
set "TIMESTAMP=!TIMESTAMP: =0!"
set "BACKUP_FILE=backups\grh_emmn_!TIMESTAMP!.sql"

echo %COLOR_INFO%[INFO] Fichier : !BACKUP_FILE!%COLOR_RESET%
echo.

docker compose exec -T postgres pg_dump -U postgres grh_emmn > "!BACKUP_FILE!"

if errorlevel 1 (
    echo %COLOR_ERR%[ERREUR] Echec de la sauvegarde.%COLOR_RESET%
    pause
    exit /b 1
)

echo %COLOR_OK%[OK] Sauvegarde reussie.%COLOR_RESET%
echo.
dir /B "backups"
echo.
goto :end

REM ============================================================
REM AIDE
REM ============================================================
:help
echo.
echo %COLOR_INFO%========================================%COLOR_RESET%
echo %COLOR_INFO%  GRH EMMN - Aide%COLOR_RESET%
echo %COLOR_INFO%========================================%COLOR_RESET%
echo.
echo   Usage : start.bat [commande]
echo.
echo   Commandes disponibles :
echo.
echo     start      Demarre l'application (defaut)
echo     rebuild    Reconstruit les images puis demarre
echo     reset      Supprime tout (volumes compris) puis demarre
echo     logs       Affiche les logs en temps reel
echo     stop       Arrete l'application (donnees conservees)
echo     restart    Redemarre l'application
echo     status     Affiche l'etat des containers
echo     shell      Ouvre un shell dans le backend
echo     psql       Ouvre psql dans PostgreSQL
echo     backup     Sauvegarde la base dans backups/
echo     help       Affiche cette aide
echo.
echo   Exemples :
echo.
echo     start.bat            Demarrage normal
echo     start.bat rebuild    Apres modification du code
echo     start.bat logs       Pour voir ce qui se passe
echo.
goto :end

REM ============================================================
REM FIN
REM ============================================================
:end
endlocal
exit /b 0