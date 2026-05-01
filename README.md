# Project Architecture & Automated Deployment Flow

A complete guide to our mono-repo application structure, deployment pipeline, and how everything works from development to production.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Project Structure](#project-structure)
3. [Technology Stack](#technology-stack)
4. [Service Architecture](#service-architecture)
5. [Startup Sequence](#startup-sequence)
6. [Database Migration Strategy](#database-migration-strategy)
7. [CI/CD Pipeline Flow](#cicd-pipeline-flow)
8. [Environment Variables](#environment-variables)
9. [Networking & Reverse Proxy](#networking--reverse-proxy)
10. [Deployment Process](#deployment-process)
11. [Troubleshooting](#troubleshooting)

---

## Project Overview

This is a **production-grade, containerized full-stack application** built with:
- **Node.js + Express** backend API
- **React + Vite** frontend SPA
- **PostgreSQL** database
- **Nginx** reverse proxy
- **Docker** containerization
- **GitHub Actions** CI/CD
- **Oracle Container Image Registry (OCIR)** image storage
- **OCI VM** cloud deployment

The application follows a **mono-repo** pattern with separate backend, frontend, and nginx services orchestrated via a single `docker-compose.yml` file.

---

## Project Structure

```
/root
├── docker-compose.yml              # Orchestration file (4 services)
├── .env.example                    # Environment template
├── .gitignore                      # Git exclusions
│
├── backend/
│   ├── package.json               # Node.js dependencies
│   ├── package-lock.json          # Dependency lock file
│   ├── index.js                   # Express server entry point
│   ├── Dockerfile                 # Backend container image
│   ├── config/
│   │   └── db.js                  # Database pool configuration
│   ├── migrations/
│   │   └── 001_create_users.js   # Database migration
│   ├── routes/
│   │   └── user.routes.js         # User API endpoints
│   └── middlewares/
│       └── (custom validators & auth)
│
├── frontend/
│   ├── package.json               # React + Vite dependencies
│   ├── vite.config.js             # Vite configuration
│   ├── src/
│   │   ├── App.jsx                # Root component
│   │   └── main.jsx               # Entry point
│   ├── Dockerfile                 # Frontend container image
│   └── README.md                  # Frontend documentation
│
├── nginx/
│   ├── Dockerfile                 # Nginx container image
│   └── nginx.conf                 # Reverse proxy configuration
│
├── .cursor/
│   ├── guides/                    # Documentation
│   │   ├── SECRETS_FLOW.md       # Secrets management
│   │   ├── DEPLOYMENT.md         # Deployment details
│   │   ├── SETUP_CHECKLIST.md    # Setup reference
│   │   └── ARCHITECTURE.md       # This file
│   ├── plans/                     # Planning documents
│   └── fixes/                     # Bug fixes & notes
│
└── .github/
    └── workflows/
        └── deploy.yml             # GitHub Actions CI/CD pipeline
```

---

## Technology Stack

### Backend
| Component | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 22 (Alpine) | Runtime |
| **Express.js** | 5.x | Web framework |
| **PostgreSQL Driver** | pg 8.x | Database connection |
| **Migrations** | node-pg-migrate 8.x | Schema versioning |
| **CORS** | 2.8.x | Cross-origin requests |
| **dotenv** | 17.4.x | Environment variables |
| **nodemon** | 3.1.x | Development auto-reload |

### Frontend
| Component | Version | Purpose |
|-----------|---------|---------|
| **React** | 18.x | UI library |
| **Vite** | 5.x | Build tool & dev server |
| **Serve** | 14.x | Production HTTP server |

### Database
| Component | Version | Details |
|-----------|---------|---------|
| **PostgreSQL** | 16 (Alpine) | Primary data store |
| **Persistent Volume** | pgdata | Data persistence |
| **Tuning** | shared_buffers=64MB, max_connections=50 | Memory optimization |

### DevOps
| Component | Version | Purpose |
|-----------|---------|---------|
| **Docker** | Latest | Containerization |
| **Docker Compose** | V2+ | Multi-container orchestration |
| **Nginx** | Latest (Alpine) | Reverse proxy |
| **GitHub Actions** | Native | CI/CD automation |
| **OCIR** | Native | Container registry |

---

## Service Architecture

### High-Level Overview

```mermaid
graph TD
    Internet["🌐 Internet (Users)\nhttp://your-server-ip:80"]
    Nginx["NGINX\n:80"]
    Frontend["FRONTEND\n:3000\nReact SPA"]
    Backend["BACKEND\n:5000\nExpress"]
    Health["HEALTH\nCHECK"]
    Postgres["PostgreSQL\n:5432\n(internal)"]

    Internet --> Nginx
    Nginx --> Frontend
    Nginx --> Backend
    Nginx --> Health
    Backend --> Postgres
```

### Service Breakdown

#### 1. **PostgreSQL (Database)**
- **Port:** 5432 (internal only, no external access)
- **Storage:** Persistent volume `pgdata:/var/lib/postgresql/data`
- **Configuration:**
  - `shared_buffers=64MB` (memory for caching)
  - `max_connections=50` (connection pool limit)
- **Health Check:** `pg_isready` every 10 seconds
- **Role:** Single source of truth for application data

#### 2. **Backend (Express API)**
- **Port:** 5000 (internal only)
- **Runtime:** Node.js 22 Alpine
- **Entry Point:** `npm run migrate && node index.js`
- **Responsibilities:**
  - Run database migrations (automatic on startup)
  - Handle REST API requests
  - Database queries via `pg` driver
  - User authentication & validation
- **Environment:** All 6 database credentials passed via `docker-compose.yml`

#### 3. **Frontend (React SPA)**
- **Port:** 3000 (internal only)
- **Runtime:** Node.js 22 Alpine (using `serve` package)
- **Build:** Pre-built in Docker image via Vite
- **Responsibilities:**
  - Serve React single-page application
  - Handle client-side routing
  - API calls to backend via `/api/*` paths

#### 4. **Nginx (Reverse Proxy)**
- **Port:** 80 (PUBLIC - exposed to internet)
- **Runtime:** Nginx Alpine (lightweight)
- **Responsibilities:**
  - Route incoming traffic
  - SSL termination (if configured)
  - Load balancing (if scaled)
  - Security headers

### Service Dependencies

```mermaid
graph TD
    Postgres["postgres\n(healthy ✓)"]
    Backend["backend\n(waits for healthy)"]
    Frontend["frontend"]
    Nginx["nginx\n(waits for backend & frontend)"]

    Postgres --> Backend
    Postgres --> Frontend
    Backend --> Nginx
    Frontend --> Nginx
```

**Startup Order (Enforced by Docker Compose):**
1. PostgreSQL starts and becomes healthy
2. Backend waits for PostgreSQL health check, then runs migrations & starts
3. Frontend starts (no dependencies)
4. Nginx starts (depends on both backend & frontend)

---

## Startup Sequence

### What Happens When `docker compose up -d` Runs

```mermaid
flowchart TD
    A["$ docker compose up -d"]
    B["Docker Compose reads .env\n& docker-compose.yml"]
    C["1. Start PostgreSQL Container\n- Mount pgdata volume\n- Apply memory tuning\n- Start health checks"]
    D["Health checks run...\n10 retries × 10s interval"]
    E["PostgreSQL becomes HEALTHY ✓"]
    F["2. Start Backend Container\n- Set NODE_ENV=production\n- Export DB environment vars\n- Export DATABASE_URL"]
    G["3. Backend Startup Command\n$ npm run migrate && node ..."]
    H["Run node-pg-migrate up\nApplies new migrations\nDatabase: SCHEMA SETUP"]
    I["Start Express Server\nServer: READY :5000"]
    J["4. Start Frontend Container\nServe package on :3000\nFrontend: READY"]
    K["5. Start Nginx Container\n- Load nginx.conf\n- Proxy to backend & frontend\n- Listen on :80\nNginx: READY"]
    L["ALL SERVICES READY\nhttp://your-ip:80"]

    A --> B --> C --> D --> E --> F --> G --> H --> I --> J --> K --> L
```

---

## Database Migration Strategy

### Migration Workflow

```mermaid
flowchart TD
    A["Developer: Create New Migration File\nbackend/migrations/002_add_posts_table.js"]
    B["Commit & Push to GitHub\ngit push origin feature-branch"]
    C["GitHub Actions detects commit\nBuilds all 3 images with new file\nPushes to OCIR"]
    D["SSH to OCI VM\n$ docker compose pull\n$ docker compose up -d"]
    E["Container Startup:\n$ npm run migrate && node index.js"]
    F["node-pg-migrate checks:\n- Read migrations/ folder\n- Query pgmigrations table\n- Apply only NEW migrations\n- Record timestamp in table\n- Start Express server"]
    G["Database Schema Updated ✓\nNew Table: posts (example)\nAll with ZERO DOWNTIME"]

    A --> B --> C --> D --> E --> F --> G
```

### Migration Files

**Location:** `backend/migrations/`

**Format:** `NNN_description.js` (zero-padded)

**Example: `001_create_users.js`**

```javascript
exports.up = pgm => {
    pgm.createTable('users', {
      id: { type: 'serial', primaryKey: true },
      name: { type: 'varchar(255)', notNull: true },
      email: { type: 'varchar(255)', notNull: true, unique: true },
      password: { type: 'varchar(255)', notNull: true },
      created_at: { type: 'timestamp', default: pgm.func('NOW()') },
      updated_at: { type: 'timestamp', default: pgm.func('NOW()') },
    });
};

exports.down = pgm => pgm.dropTable('users');
```

**Migration Tracking:**

```sql
-- PostgreSQL tracks applied migrations automatically
SELECT * FROM pgmigrations;

┌────┬──────────────────────────┬──────────────────────────┐
│ id │ name                     │ run_on                   │
├────┼──────────────────────────┼──────────────────────────┤
│ 1  │ 001_create_users         │ 2025-05-01 10:30:15 UTC  │
│ 2  │ 002_add_posts_table      │ 2025-05-02 14:22:08 UTC  │
└────┴──────────────────────────┴──────────────────────────┘
```

### How Migrations Work

1. **On container start**, the command `npm run migrate` executes
2. **node-pg-migrate** connects to PostgreSQL
3. **Checks `pgmigrations` table** to see which migrations have been applied
4. **Applies only new migrations** (files not in the table)
5. **Records each migration** with timestamp
6. **Exits successfully** and starts the Express server
7. **Idempotent:** Running migrations twice doesn't duplicate changes

---

## CI/CD Pipeline Flow

### Complete Automated Deployment Process

```mermaid
flowchart TD
    A["Developer: git push origin main"]
    B["GitHub detects push to main\nTriggers .github/workflows/deploy.yml"]
    C["GitHub Actions Job Starts\nRuns on: ubuntu-latest"]

    D["1. CHECK OUT CODE\n$ git clone repo\n$ git checkout main"]

    E["2. LOGIN TO OCIR\n$ docker login bom.ocir.io\nStatus: AUTHENTICATED ✓"]

    F["3. BUILD BACKEND IMAGE\n$ docker build -f backend/Dockerfile\nFROM node:22-alpine\nnpm ci --omit=dev\nSize: ~180MB"]
    G["Tag & Push Backend Image\nbom.ocir.io/namespace/crudapp/backend:latest\nStatus: PUSHED ✓"]

    H["4. BUILD FRONTEND IMAGE\n$ docker build -f frontend/Dockerfile\nStage 1: npm run build via Vite\nStage 2: serve dist/\nSize: ~150MB"]
    I["Tag & Push Frontend Image\nbom.ocir.io/namespace/crudapp/frontend:latest\nStatus: PUSHED ✓"]

    J["5. BUILD NGINX IMAGE\n$ docker build -f nginx/Dockerfile\nFROM nginx:alpine\nCOPY nginx.conf\nSize: ~15MB"]
    K["Tag & Push Nginx Image\nbom.ocir.io/namespace/crudapp/nginx:latest\nStatus: PUSHED ✓"]

    L["6. SSH TO OCI VM\n$ ssh ubuntu@your.vm.public.ip\nStatus: CONNECTED ✓"]

    M["7. PULL LATEST IMAGES\n$ docker compose pull\nDownloads backend, frontend, nginx\nStatus: PULLED ✓"]

    N["8. RESTART CONTAINERS\n$ docker compose up -d\n- Stop old containers\n- Start new containers\n- Preserve pgdata volume\n- Run migrations automatically\nTiming: ~30-60 seconds"]

    O["9. HEALTH CHECKS\nPostgreSQL: pg_isready ✓\nBackend: migrations ✓\nFrontend: :3000 ✓\nNginx: :80 ✓"]

    P["✅ DEPLOYMENT COMPLETE\nApp live at: http://your.vm.public.ip\nTotal time: ~7-10 minutes"]

    A --> B --> C --> D --> E --> F --> G --> H --> I --> J --> K --> L --> M --> N --> O --> P
```

### Pipeline Status Checks

At each stage, GitHub Actions:
- ✅ Logs all output to Actions tab
- ✅ Reports success/failure status
- ✅ Sends failure notifications (if configured)
- ✅ Stores artifacts (if configured)

### Rollback Strategy

If deployment fails:
1. GitHub Actions shows error in Actions tab
2. Previous images still exist in OCIR
3. Manual rollback: SSH and run `docker compose up -d` with old images
4. Or revert commit and push again (triggers new deployment)

---

## Environment Variables

### Variables Required

All variables are defined in `.env` file on the OCI VM (never pushed to GitHub).

```bash
# Database Configuration
DB_NAME=crudapp              # PostgreSQL database name
DB_USER=cruduser             # PostgreSQL user
DB_PASSWORD=your-password    # PostgreSQL password (STRONG!)

# Container Registry
OCIR_REGISTRY=bom.ocir.io                    # Oracle registry endpoint
OCIR_REPO=your-namespace/crudapp             # Repository path
TAG=latest                                    # Image tag

# GitHub Actions Secrets (separate from .env)
OCIR_USERNAME=namespace/user@email.com       # For docker login
OCIR_TOKEN=xxxxxxxxxxxx                      # Auth token
OCI_HOST=your.vm.public.ip                   # VM address
OCI_USER=ubuntu                              # VM user
OCI_SSH_PRIVATE_KEY=-----BEGIN PRIVATE KEY...# SSH key
```

### How Variables Flow

```mermaid
flowchart TD
    A["GitHub Secrets (encrypted)"]
    B["GitHub Actions Job"]
    C["docker login -u OCIR_USERNAME -p OCIR_TOKEN"]
    D["ssh -i key ubuntu@OCI_HOST"]
    E["OCI VM .env file"]
    F["docker-compose.yml reads & substitutes"]
    G["Backend\nPGHOST, PGUSER, PGPASSWORD"]
    H["Frontend\nNODE_ENV=production"]
    I["Nginx\n(no env vars needed)"]

    A --> B
    B --> C
    B --> D
    D --> E
    E --> F
    F --> G
    F --> H
    F --> I
```

### .env File on OCI VM

```bash
# Location: /home/ubuntu/crudapp/.env
# Permissions: 600 (owner read/write only)

DB_NAME=crudapp
DB_USER=cruduser
DB_PASSWORD=YourStrong_P@ssw0rd!

OCIR_REGISTRY=bom.ocir.io
OCIR_REPO=your-namespace/crudapp
TAG=latest
```

---

## Networking & Reverse Proxy

### Network Architecture

```mermaid
graph TD
    subgraph External
        Internet["🌐 External Internet\nhttp://your.vm.ip:80"]
    end

    subgraph Docker["Internal Docker Network (crudapp_default)"]
        Nginx["NGINX :80\n/  → frontend:3000\n/api/ → backend:5000\n/health → backend:5000/health"]
        Frontend["FRONTEND :3000\nReact SPA\nStatic files\nClient routing"]
        Backend["BACKEND :5000\nExpress API\nControllers\nDB queries"]
        Postgres["POSTGRES :5432\n(internal only)"]
    end

    Internet --> Nginx
    Nginx --> Frontend
    Nginx --> Backend
    Backend --> Postgres
```

### DNS Resolution in Nginx

**Problem:** Container hostnames (frontend, backend) aren't immediately available on startup.

**Solution:** Docker internal DNS resolver at `127.0.0.11:53`

```nginx
# nginx.conf
resolver 127.0.0.11:53 valid=10s;
resolver_timeout 5s;

# This allows dynamic hostname resolution instead of static IP binding
location / {
    proxy_pass http://frontend:3000;  # ← resolves dynamically
}
```

### Request Flow Example

```mermaid
sequenceDiagram
    participant User
    participant Nginx
    participant Backend
    participant Postgres

    User->>Nginx: GET /api/users
    Note over Nginx: Matches location /api/<br/>Resolves backend → 172.19.0.3:5000<br/>Adds X-Real-IP, X-Forwarded-For headers
    Nginx->>Backend: GET /api/users
    Backend->>Postgres: SELECT * FROM users
    Postgres-->>Backend: rows[]
    Backend-->>Nginx: JSON response
    Nginx-->>User: { users: [...] }
    Note over User: Browser renders
```

---

## Deployment Process

### Pre-Deployment Checklist

- [ ] All code committed and pushed to main branch
- [ ] GitHub Secrets configured (8 secrets)
- [ ] OCI VM .env file created and permissions set
- [ ] OCI Security List allows port 80
- [ ] SSH key registered and working
- [ ] OCIR credentials configured on VM

### Step-by-Step Deployment

#### **Step 1: Developer Pushes Code**

```bash
# Local machine
git add .
git commit -m "Add new feature"
git push origin main
```

#### **Step 2: GitHub Actions Triggers**

Automatically via webhook when push detected to `main` branch.

View progress:
```bash
# GitHub UI
repo → Actions tab → "Deploy" workflow → Click latest run
```

#### **Step 3: Actions Logs**

Each step logs to Actions console:
- ✅ Checkout code
- ✅ Login to OCIR
- ✅ Build backend image
- ✅ Push backend image
- ✅ Build frontend image
- ✅ Push frontend image
- ✅ Build nginx image
- ✅ Push nginx image
- ✅ Connect to OCI VM
- ✅ Pull images
- ✅ Restart containers

#### **Step 4: On OCI VM**

SSH to VM and check deployment:

```bash
# SSH to VM
ssh ubuntu@your.vm.ip

# Check running containers
docker ps

# Should show all 4 services running:
# postgres | backend | frontend | nginx

# Check logs
docker compose logs backend     # See migrations & startup
docker compose logs frontend    # See serve startup
docker compose logs nginx       # See proxy startup

# Check migrations applied
docker compose exec backend npm run migrate:status

# Health check
curl http://localhost/health
# Response: { "success": true, "message": "Server is running", ... }
```

#### **Step 5: Verify Deployment**

From your local machine:

```bash
# Access app
curl http://your.vm.ip
# Should return React HTML

# Test API
curl http://your.vm.ip/api/users
# Should return JSON array

# Test health endpoint
curl http://your.vm.ip/health
# Should return: { "success": true, ... }
```

Or open browser: `http://your.vm.ip`

---

## Troubleshooting

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| **GitHub Actions fails at "Push image"** | OCIR credentials invalid | Check GitHub Secrets: `OCIR_USERNAME`, `OCIR_TOKEN`, `OCIR_REGISTRY` |
| **SSH connection fails** | SSH key format or permissions | Verify key is in PEM format, not OpenSSH format; try `ssh-keygen -p -N "" -m pem -f id_rsa` |
| **App doesn't start on VM** | Images not pulled correctly | SSH to VM, run `docker compose pull --no-parallel`, then `docker compose up -d` |
| **Database migrations fail** | Migration file syntax error | Check `backend/migrations/` files; syntax must follow node-pg-migrate format |
| **Backend can't connect to DB** | Wrong `DATABASE_URL` format | Verify in docker-compose.yml: `postgres://{user}:{password}@postgres:5432/{db}` |
| **Frontend returns 404** | Nginx routing misconfigured | Check `nginx/nginx.conf`: location `/` should proxy to `http://frontend:3000` |
| **Can't reach app at port 80** | Port not opened in OCI | OCI Console → VCN → Security List → Add Ingress Rule for port 80 |
| **Disk full on VM** | Old images and containers accumulating | Run `docker image prune -a` and `docker container prune` |
| **Containers keep restarting** | Application crash in container | Run `docker compose logs {service}` to see errors |
| **High CPU usage** | Database connection pool exhausted | Check `max_connections=50` setting in postgres service |

### Debugging Commands

**On OCI VM:**

```bash
# View all container logs
docker compose logs -f

# View specific service logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx
docker compose logs -f postgres

# Check container status
docker ps -a

# Inspect a running container
docker inspect container_name

# Execute command inside container
docker compose exec backend npm run migrate:status
docker compose exec postgres psql -U cruduser -d crudapp -c "SELECT * FROM pgmigrations;"

# Check disk usage
docker system df

# Restart specific service
docker compose restart backend

# View environment variables in container
docker compose exec backend env | grep PG

# Network diagnostics
docker compose exec backend ping frontend
docker compose exec backend curl http://backend:5000/health
```

### Rollback Procedure

If deployment breaks production:

```bash
# SSH to VM
ssh ubuntu@your.vm.ip

# Check available images
docker images | grep crudapp

# If previous tag still exists, rollback to it
# Edit docker-compose.yml: change TAG=latest to TAG=previous-tag
nano .env
# Change: TAG=old-working-tag

# Restart containers
docker compose pull
docker compose up -d

# Verify health
curl http://localhost/health
```

Or manually revert git commit and push again (triggers new deployment).

---

## Appendix: Key Files Reference

### `docker-compose.yml`
Main orchestration file. Defines all 4 services, environment variables, volumes, dependencies, and health checks.

### `backend/Dockerfile`
Builds Node.js 22 Alpine image. Multi-stage to minimize size. Runs migrations on startup.

### `frontend/Dockerfile`
Builds React SPA. Two-stage: build with Vite in stage 1, serve in stage 2 with `serve` package.

### `nginx/Dockerfile`
Lightweight Nginx Alpine image. Copies custom `nginx.conf` for routing.

### `nginx/nginx.conf`
Reverse proxy configuration. Routes `/` to frontend, `/api/*` to backend, `/health` to backend.

### `.github/workflows/deploy.yml`
GitHub Actions workflow. Triggers on push to main, builds images, pushes to OCIR, deploys to OCI VM.

### `backend/migrations/001_create_users.js`
Initial database migration. Creates `users` table. Uses node-pg-migrate syntax.

### `.env.example`
Template for `.env` file (on OCI VM). Copy to `.env` and fill in your values.

---

## Summary

This architecture provides:

✅ **Scalability** — Each service independent, can scale separately
✅ **Reliability** — Health checks, automatic restarts, persistent volumes
✅ **Automation** — Full CI/CD pipeline, zero-touch deployments
✅ **Security** — Secrets management, private networking, OCIR authentication
✅ **Maintainability** — Clear service separation, documented flow, easy troubleshooting
✅ **Production-Ready** — Follows industry standards for containerized apps

Every `git push main` automatically triggers a full deployment cycle with zero downtime (for data persistence). Migrations run automatically without manual intervention. The entire system is declarative via docker-compose.yml and version-controlled.