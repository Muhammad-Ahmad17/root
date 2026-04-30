# CI/CD Pipeline Setup Guide

## Architecture Overview

```
GitHub Repo
    ↓ (git push)
GitHub Actions
    ├─→ Build backend image → push to OCIR
    ├─→ Build frontend image → push to OCIR
    ├─→ Build nginx image → push to OCIR
    └─→ SSH into OCI VM → docker compose pull & up
    
OCI VM (1GB AMD Instance)
    ├─ nginx (port 80) → reverse proxy
    ├─ frontend (port 3000, internal) → React SPA server
    ├─ backend (port 5000, internal) → Express API
    └─ postgres (internal) → database
```

---

## Separate nginx Service (Why This Approach)

**Architecture:**
- **nginx** runs as a separate container (reverse proxy)
- **frontend** serves React SPA on port 3000 (using `serve` package)
- **backend** runs Express on port 5000
- **postgres** runs database (internal only)

**Benefits:**

1. **Clean separation of concerns** — each service has one job
2. **Independent scaling** — can restart nginx without restarting frontend
3. **Flexible** — easier to add more services or replace nginx with another reverse proxy
4. **Standard production pattern** — mirrors how many production systems are built
5. **Works with existing infrastructure** — fits well alongside your existing setup

**Flow:**
```
User → http://your-vm-ip:80 (nginx)
         ├─ /          → frontend:3000 (React SPA)
         ├─ /api/*     → backend:5000 (Express API)
         └─ /health    → backend:5000
```

---

## What You Need to Do to Run the Pipeline

### 1. **GitHub Secrets** (ONE-TIME SETUP)

Go to: **Settings → Secrets and variables → Actions**

Add these 8 secrets:

| Secret Name | Value | Where to get |
|---|---|---|
| `OCIR_REGISTRY` | `bom.ocir.io` | Fixed (Mumbai region) |
| `OCIR_USERNAME` | `your-namespace/your@email.com` | OCI Console → My Profile → Auth Tokens |
| `OCIR_TOKEN` | paste your auth token | OCI Console → My Profile → Auth Tokens → Generate Token |
| `OCIR_REPO` | `your-namespace/crudapp` | Your OCI tenancy namespace |
| `OCI_HOST` | `your.vm.public.ip` | OCI Console → Compute → Instance → Public IP address |
| `OCI_USER` | `ubuntu` | Default on OCI Ubuntu images |
| `OCI_SSH_PRIVATE_KEY` | `contents of ~/.ssh/id_rsa` | Your local SSH private key |
| `DB_PASSWORD` | `strong_password_here` | Your PostgreSQL password |

**How to generate OCI Auth Token:**
1. OCI Console → top-right (profile icon) → My Profile
2. Left sidebar → Auth Tokens
3. Click "Generate Token"
4. Copy the token (appears only once)

**How to get SSH private key:**
```bash
cat ~/.ssh/id_rsa
```
Copy the entire output (including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`).

---

### 2. **OCI VM Setup** (ONE-TIME SETUP)

SSH into your OCI instance and run:

```bash
# Install Docker + Compose
sudo apt update && sudo apt install -y docker.io docker-compose-plugin

# Add ubuntu to docker group
sudo usermod -aG docker ubuntu
newgrp docker

# Create deployment directory (separate from existing projects)
mkdir -p /home/ubuntu/crudapp
cd /home/ubuntu/crudapp

# Get the docker-compose.yml from GitHub
wget https://raw.githubusercontent.com/YOUR-USERNAME/YOUR-REPO/main/docker-compose.yml

# Create .env file with your credentials
cat > .env <<EOF
DB_NAME=crudapp
DB_USER=cruduser
DB_PASSWORD=your_password_here

OCIR_REGISTRY=bom.ocir.io
OCIR_REPO=your-namespace/crudapp
TAG=latest
EOF
```

---

### 3. **OCI Security List** (ONE-TIME SETUP)

Open port 80 in your OCI Security List:

1. OCI Console → VCN
2. Find your subnet's Security List
3. Add Ingress Rule:
   - Source CIDR: `0.0.0.0/0`
   - Destination Port: `80`
   - Protocol: `TCP`

---

### 4. **Verify SSH Access**

```bash
ssh ubuntu@your-vm-ip "docker ps"  # Should not ask for password
```

---

## Docker Compose Services

```yaml
postgres   (internal)    ← Database
backend    (port 5000)   ← Express API (internal)
frontend   (port 3000)   ← React SPA server (internal)
nginx      (port 80)     ← Reverse proxy (PUBLIC)
```

**nginx routes:**
- `/` → frontend:3000
- `/api/*` → backend:5000
- `/health` → backend:5000

---

## Summary Checklist

- [ ] Add 8 GitHub Secrets
- [ ] SSH into VM and install Docker
- [ ] Create `/home/ubuntu/crudapp` directory
- [ ] Create `.env` file on VM
- [ ] Download `docker-compose.yml` to VM
- [ ] Open port 80 in OCI Security List
- [ ] Test SSH access
- [ ] `git push origin main` → Pipeline runs
- [ ] Visit `http://your-vm-public-ip` → App is live

Done! 🚀
