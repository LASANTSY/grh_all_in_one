# README global du projet GRH EMMN

---
```

```markdown
# GRH EMMN — Application de Gestion des Ressources Humaines

Application web de gestion des ressources humaines de l'**État-Major de la Marine Nationale (EMMN)**, destinée à remplacer une base Microsoft Access mono-poste.

---

## Sommaire

1. [Présentation](#présentation)
2. [Architecture](#architecture)
3. [Prérequis](#prérequis)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Base de données](#base-de-données)
7. [Démarrage](#démarrage)
8. [Comptes de démonstration](#comptes-de-démonstration)
9. [Structure du projet](#structure-du-projet)
10. [API REST](#api-rest)
11. [Rôles et permissions](#rôles-et-permissions)
12. [Scripts utiles](#scripts-utiles)
13. [Dépôts Git](#dépôts-git)
14. [Sécurité](#sécurité)
15. [Roadmap](#roadmap)

---

## Présentation

L'application permet de gérer :

- Les **dossiers individuels** du personnel militaire (officiers, officiers mariniers, QMO) ;
- Les **référentiels** (bases, unités, grades, spécialités) ;
- La **recherche multicritère** et tolérante aux fautes de frappe ;
- Les **historiques** (grades, affectations, décorations, formations, documents) — jamais écrasés ;
- Les **pièces jointes** avec versionnement ;
- L'**import Excel** en masse avec détection de doublons et rapport d'erreurs ;
- Le **tableau de bord statistique** (KPI, répartitions, alertes fin de lien) ;
- La **gestion des comptes** et des **permissions** (5 rôles) ;
- Le **workflow de validation** des modifications proposées par les agents ;
- Le **journal d'audit** de toutes les actions sensibles ;
- Les **alertes de fin de lien** avec code couleur réglementaire.

---

## Architecture

```
┌───────────────────────────────────────────────────────┐
│                    NAVIGATEUR                          │
│  React 18 + TypeScript + Vite + Tailwind CSS v4.3     │
│  shadcn/ui · TanStack Query · React Hook Form · Zod    │
└──────────────────────┬────────────────────────────────┘
                       │ HTTPS / REST JSON (JWT)
                       ▼
┌───────────────────────────────────────────────────────┐
│                  API REST — NestJS                     │
│  TypeORM · PostgreSQL · Swagger · class-validator      │
│  12 modules métier · RBAC · Audit · Périmètre          │
└──────────────────────┬────────────────────────────────┘
                       │
                       ▼
┌───────────────────────────────────────────────────────┐
│                  PostgreSQL 16                         │
│  20 entités · Index trigram · Migrations versionnées   │
└───────────────────────────────────────────────────────┘
                       │
                       ▼
┌───────────────────────────────────────────────────────┐
│          Stockage fichiers (local / S3)                │
└───────────────────────────────────────────────────────┘
```

**Deux applications distinctes** (pas de monorepo) :

- `backend/` — API NestJS
- `frontend/` — SPA React

---

## Prérequis

| Outil | Version minimale | Vérification |
|---|---|---|
| Node.js | 20.x LTS | `node --version` |
| npm | 10.x | `npm --version` |
| PostgreSQL | 16 | `psql --version` |
| Git | 2.x | `git --version` |

**Systèmes testés** : Windows 10/11 (PowerShell), Linux (Ubuntu 22.04), macOS.

**Note pour Windows** : la compilation de `bcrypt` (dépendance native) peut nécessiter **Visual Studio Build Tools** avec le workload « Desktop development with C++ ».

**Alternative** : remplacer `bcrypt` par `bcryptjs` (pur JS) si la compilation pose problème.

---

## Installation

### 1. Cloner les dépôts

```bash
git clone https://github.com/LASANTSY/backend_grh_emmn.git backend
git clone https://github.com/LASANTSY/frontend_grh_emmn.git frontend
```

Ou récupérer l'ensemble du projet si vous disposez déjà de l'arborescence complète.

### 2. Installer les dépendances

**Backend** :

```bash
cd backend
npm install
```

**Frontend** :

```bash
cd ../frontend
npm install
```

### 3. Créer la base PostgreSQL

```bash
psql -U postgres
```

Dans `psql` :

```sql
CREATE DATABASE grh_emmn;
\q
```

### 4. Exécuter les migrations

```bash
cd backend
npm run migration:run
```

**Attendu** : 20 tables créées, 8 types enum, index.

Vérification :

```bash
psql -U postgres -d grh_emmn -c "\dt"
```

### 5. Charger les données de démonstration

```bash
npm run seed
```

**Attendu** :

- 3 bases
- 19 unités
- 18 grades
- 18 spécialités
- 4 comptes de démonstration

---

## Configuration

### Backend — `backend/.env`

Copiez le modèle :

```bash
cd backend
cp .env.example .env
```

Éditez `.env` et adaptez les valeurs :

```dotenv
# Application
NODE_ENV=development
APP_PORT=3000
FRONTEND_URL=http://localhost:5173

# Base de donnees
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=root1234
DB_DATABASE=grh_emmn

# JWT — GENERER DES SECRETS UNIQUES
JWT_ACCESS_SECRET=<secret_unique_de_32_caracteres_minimum>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<autre_secret_unique_de_32_caracteres_minimum>
JWT_REFRESH_EXPIRES_IN=7d

# Securite
BCRYPT_SALT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=15

# Stockage
STORAGE_DRIVER=local
STORAGE_LOCAL_PATH=./storage
MAX_FILE_SIZE_MB=10
ALLOWED_MIME_TYPES=application/pdf,image/jpeg,image/png,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document

# Import
IMPORT_MAX_ROWS=2000
IMPORT_SYNC_THRESHOLD=500
```

**Générer un secret fort** (PowerShell) :

```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

### Frontend — `frontend/.env`

```bash
cd ../frontend
cp .env.example .env
```

```dotenv
VITE_API_URL=/api
VITE_APP_NAME=GRH EMMN
VITE_APP_URL=http://localhost:5173
```

**Note** : le proxy Vite redirige `/api/*` vers `http://localhost:3000`. En production, adaptez `VITE_API_URL` vers l'URL réelle de l'API.

---

## Base de données

### Schéma

**20 entités TypeORM** réparties en 4 groupes :

**Référentiels** : `base`, `unite`, `grade`, `specialite`

**Personnel et historiques** : `personnel`, `enfant`, `historique_grade`, `cursus_scolaire`, `stage_militaire`, `competence_linguistique`, `affectation`, `decoration`

**Documents** : `piece_jointe`, `version_piece_jointe`

**Sécurité et traçabilité** : `compte_utilisateur`, `refresh_token`, `demande_modification`, `entree_audit`, `import_personnel`, `ligne_import`

### Migrations

```bash
# Voir l'etat
npm run migration:show

# Executer
npm run migration:run

# Revenir en arriere (1 migration)
npm run migration:revert

# Generer une nouvelle migration apres modification des entites
npm run migration:generate -- src/database/migrations/NomMigration
```

**Règle importante** : `synchronize: false` en dur — jamais activé, même en développement. Toute modification de schéma passe par une migration versionnée.

### Seeds

```bash
npm run seed
```

**Idempotent** : peut être relancé sans créer de doublons.

---

## Démarrage

### Terminal 1 — Backend

```bash
cd backend
npm run start:dev
```

**Attendu** :

```
[Nest] LOG [Bootstrap] Swagger disponible sur http://localhost:3000/api/docs
[Nest] LOG [Bootstrap] Application demarree sur http://localhost:3000/api
```

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

**Attendu** :

```
VITE v8.3.0  ready in xxx ms
➜  Local:   http://localhost:5173/
```

### Vérification

- **Backend** : http://localhost:3000/api/docs (Swagger)
- **Frontend** : http://localhost:5173

---

## Comptes de démonstration

**Ces comptes sont PUBLICS et destinés au développement/démonstration uniquement. Ne jamais les utiliser en production.**

| Identifiant | Mot de passe | Rôle | Périmètre |
|---|---|---|---|
| `admin` | `Admin@2024!` | Administrateur système | Global |
| `rh.emmn` | `RhEmmn@2024!` | RH État-Major | Global |
| `rh.bana` | `RhBana@2024!` | RH Base | RC TROZONA |
| `chef.bana` | `ChefBana@2024!` | Chef / Commandement | RC TROZONA |

**À la première connexion** : changement de mot de passe obligatoire.

**En production** : supprimer ces comptes et créer des comptes via l'API d'administration avec des mots de passe robustes.

---

## Structure du projet

```
grh-emmn/
├── backend/
│   ├── src/
│   │   ├── app/                       # Module racine NestJS
│   │   ├── common/                    # Guards, filters, interceptors, decorators
│   │   ├── config/                    # Configuration typée (Joi)
│   │   ├── database/
│   │   │   ├── migrations/            # Migrations versionnées
│   │   │   └── seeds/                 # Données de démonstration
│   │   └── modules/                   # 12 modules métier
│   │       ├── auth/                  # JWT + refresh token
│   │       ├── utilisateurs/          # Comptes
│   │       ├── bases/                 # Référentiel
│   │       ├── unites/                # Référentiel
│   │       ├── grades/                # Référentiel
│   │       ├── specialites/           # Référentiel
│   │       ├── personnels/            # Coeur du système
│   │       ├── documents/             # Pièces jointes versionnées
│   │       ├── imports/               # Import Excel
│   │       ├── dashboard/             # Statistiques
│   │       ├── demandes-modification/ # Workflow validation
│   │       └── audit/                 # Journal
│   ├── test/                          # Tests e2e
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── app/                       # Providers + router
│   │   ├── components/
│   │   │   ├── ui/                    # shadcn/ui
│   │   │   ├── layout/                # Sidebar, Header, AppLayout
│   │   │   └── shared/                # Composants réutilisables
│   │   ├── features/                  # Organisation par domaine
│   │   │   ├── auth/
│   │   │   ├── personnels/
│   │   │   ├── referentiels/
│   │   │   ├── dashboard/
│   │   │   ├── documents/
│   │   │   ├── imports/
│   │   │   ├── demandes-modification/
│   │   │   ├── audit/
│   │   │   └── utilisateurs/
│   │   ├── pages/                     # Pages de routage
│   │   ├── routes/                    # Guards de route
│   │   ├── hooks/                     # Hooks globaux
│   │   ├── lib/                       # Axios, utils, formatters
│   │   └── types/                     # Types TypeScript
│   ├── public/
│   │   └── logo.png                   # SEUL logo autorise
│   ├── package.json
│   └── .env.example
│
├── docs/
├── scripts/
├── docker/
├── docker-compose.yml
└── README.md
```

---

## API REST

**Base URL** : `http://localhost:3000/api`

**Documentation interactive** : `http://localhost:3000/api/docs` (Swagger)

### Endpoints principaux

| Domaine | Endpoints | Rôles |
|---|---|---|
| **Auth** | `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/change-password` | Public / Authentifié |
| **Utilisateurs** | `GET/POST/PATCH/DELETE /utilisateurs` | ADMIN_SYSTEME |
| **Bases** | `GET/POST/PATCH/DELETE /bases` | Lecture authentifiée, écriture ADMIN |
| **Unités** | idem + filtre `?baseId=` | idem |
| **Grades** | idem | idem |
| **Spécialités** | idem | idem |
| **Personnels** | `GET /personnels` (recherche), `GET /personnels/:id`, `POST/PATCH/DELETE` | RH_* (périmètre), CHEF (lecture) |
| **Historiques** | `GET/POST/PATCH/DELETE /personnels/:id/enfants`, `/historique-grades`, `/affectations`, `/decorations`, `/cursus-scolaire`, `/stages-militaires`, `/competences-linguistiques` | RH_* |
| **Documents** | `GET/POST /personnels/:id/documents`, `POST /:docId/versions`, `GET /:docId/download` | RH_*, PERSONNEL (siens) |
| **Imports** | `GET /imports/template`, `POST /imports/preview`, `POST /imports/execute`, `GET /imports` | RH_* |
| **Dashboard** | `GET /dashboard/stats`, `/repartition-base`, `/repartition-unite`, `/repartition-grade`, `/repartition-specialite`, `/departs-retraite`, `/fin-de-lien` | RH_*, CHEF |
| **Demandes** | `POST/GET /demandes-modification`, `POST /:id/valider`, `POST /:id/rejeter` | PERSONNEL (créer), RH_* (valider) |
| **Audit** | `GET /audit`, `GET /audit/:id` | ADMIN_SYSTEME, RH_ETAT_MAJOR |

### Format des erreurs

```json
{
  "statusCode": 400,
  "code": "PERSONNEL_DUPLICATE",
  "message": "Une fiche avec le meme matricule ou la meme CIN existe deja.",
  "details": [{ "champ": "matriculeRecrutement", "valeur": "TEST-001" }],
  "path": "/api/personnels",
  "timestamp": "2026-09-24T02:55:04.672Z"
}
```

### Authentification

- **Login** → renvoie un `accessToken` (JWT, 15 min) + pose un cookie `refresh_token` httpOnly (7 jours).
- **Requêtes** → header `Authorization: Bearer <accessToken>`.
- **Refresh** → automatique via intercepteur Axios en cas de 401.

---

## Rôles et permissions

| Rôle | Portée | Peut faire |
|---|---|---|
| `ADMIN_SYSTEME` | Global | Tout + gestion comptes + référentiels + paramètres |
| `RH_ETAT_MAJOR` | Global | CRUD personnel + imports + exports + audit |
| `RH_BASE` | Sa base/unité | Mêmes droits que RH_ETAT_MAJOR mais limité à son périmètre |
| `CHEF_COMMANDEMENT` | Lecture | Consultation des fiches de son périmètre, dashboards |
| `PERSONNEL` | Soi-même | Consulter sa fiche, proposer des modifications (workflow), voir les coordonnées professionnelles des autres |

### Champs modifiables par le profil PERSONNEL

Via workflow (validation RH obligatoire) : email, téléphone, adresse, situation familiale (certains champs), photo.

**Non modifiables** : grade, matricule, CIN, passeport, décorations, affectations, décisions, données militaires officielles.

---

## Scripts utiles

### Backend

| Script | Description |
|---|---|
| `npm run start:dev` | Démarrage en mode watch |
| `npm run build` | Build production |
| `npm run start:prod` | Démarrage production |
| `npm run test` | Tests unitaires |
| `npm run test:e2e` | Tests end-to-end |
| `npm run test:cov` | Couverture de tests |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run migration:run` | Exécuter les migrations |
| `npm run migration:revert` | Annuler la dernière migration |
| `npm run migration:show` | État des migrations |
| `npm run seed` | Charger les données de démonstration |

### Frontend

| Script | Description |
|---|---|
| `npm run dev` | Serveur de développement (port 5173) |
| `npm run build` | Build production |
| `npm run preview` | Prévisualiser le build |
| `npm run typecheck` | Vérification TypeScript |
| `npm run lint` | ESLint |

---

## Dépôts Git

| Dépôt | URL |
|---|---|
| Backend | https://github.com/LASANTSY/backend_grh_emmn |
| Frontend | https://github.com/LASANTSY/frontend_grh_emmn |

**Convention de commit** (Conventional Commits) :

- `feat:` nouvelle fonctionnalité
- `fix:` correction de bug
- `chore:` tâche technique
- `docs:` documentation
- `refactor:` refactorisation
- `test:` tests

---

## Sécurité

### Mesures implémentées

- **JWT** avec access token (15 min) + refresh token (7 jours, cookie httpOnly)
- **Hash bcrypt** des mots de passe (12 rounds)
- **Verrouillage automatique** après 5 échecs de connexion
- **Politique de mot de passe robuste** (majuscule + minuscule + chiffre)
- **RBAC** + contrôle du périmètre organisationnel
- **Journal d'audit** de toutes les actions sensibles
- **Helmet** pour les en-têtes HTTP
- **CORS** restreint au frontend
- **Validation stricte** des DTOs (class-validator)
- **Protection contre le path traversal** pour les fichiers
- **Aucun secret dans le code** — variables d'environnement
- **Fichiers `.env`** exclus de Git

### À faire en production

- **HTTPS obligatoire**
- **Secrets JWT** forts (générés aléatoirement, jamais commités)
- **PostgreSQL** avec utilisateur dédié (pas `postgres`)
- **Sauvegardes automatiques** quotidiennes
- **Stockage S3/MinIO** au lieu du local
- **Reverse proxy** (nginx) avec rate limiting
- **Suppression des comptes de démonstration**
- **Rotation des logs**
- **Chiffrement au repos** des données sensibles

### Données sensibles

Les données sont **personnelles et militaires**. Règles absolues :

- Aucune donnée réelle dans les seeds, tests ou Git
- Aucun log de mot de passe, token ou donnée personnelle
- Exports contrôlés et audités
- Accès restreint par le moindre privilège

---

## Roadmap

### V1 (livrée)

- [x] Authentification complète (JWT + refresh)
- [x] RBAC + périmètre organisationnel
- [x] CRUD référentiels
- [x] CRUD personnel + 7 historiques
- [x] Recherche multicritère + floue
- [x] Détection de doublons
- [x] Calcul fin de lien
- [x] Dashboard statistique
- [x] Import Excel avec prévisualisation
- [x] Workflow de validation
- [x] Journal d'audit
- [x] Documentation API (Swagger)

### V2 (évolutions)

- [ ] Prévisualisation PDF/images des pièces jointes
- [ ] Export PDF fiches individuelles
- [ ] Notifications email fin de lien
- [ ] Migration automatisée depuis Access
- [ ] Multilingue (fr / en / mg)
- [ ] Dockerisation complète
- [ ] Tests e2e complets
- [ ] Tableau de bord H/F (nécessite ajout champ `sexe`)
- [ ] Cache Redis pour les sessions multi-instance
- [ ] Chiffrement des fichiers au repos

---

## Support

Pour toute question ou problème :

1. Vérifiez que les prérequis sont installés (versions correctes).
2. Vérifiez que le `.env` est configuré.
3. Vérifiez que PostgreSQL est démarré et que la base existe.
4. Consultez les logs (`npm run start:dev` côté backend).

**En cas de bug** : ouvrez une issue sur le dépôt concerné avec :
- Version de Node.js
- Système d'exploitation
- Étapes de reproduction
- Message d'erreur complet

---

## Licence

Projet interne — État-Major de la Marine Nationale.

Tous droits réservés. Ne pas distribuer sans autorisation.
```

---

## Où placer ce fichier

Deux emplacements possibles :

**Option 1 (recommandée)** — À la racine du projet local, **non versionné** :

```powershell
cd D:\PROJETO\grh-emmn
# Creer le fichier README.md avec le contenu ci-dessus
```

Ce fichier sert de **documentation unifiée** pour votre environnement local. Il n'est pas poussé sur GitHub car il n'est dans aucun dépôt Git.

**Option 2** — Versionner dans chaque dépôt :

- `backend/README.md` : version adaptée (installation backend uniquement)
- `frontend/README.md` : version adaptée (installation frontend uniquement)

Pour créer une **version backend** du README, dites-le moi et je la génère. Idem pour le frontend.

---

## Note sur le logo

Le fichier `frontend/public/logo.png` **doit être fourni** par vous. Ce README y fait référence mais ne le contient pas.

Sans ce logo, l'application affichera une icône cassée dans la sidebar et la page de connexion.

