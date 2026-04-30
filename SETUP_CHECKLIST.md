# CI/CD Setup Checklist (Separate nginx)

## ✅ What's Already Done

- [x] Backend Dockerfile (Node.js multi-stage)
- [x] Frontend Dockerfile (React SPA server)
- [x] Nginx Dockerfile (separate reverse proxy)
- [x] docker-compose.yml (4 services: postgres, backend, frontend, nginx)
- [x] GitHub Actions workflow (builds 3 images)
- [x] .env.example (environment template)
- [x] .gitignore (excludes secrets)
- [x] Documentation files

**Architecture:**
- nginx (port 80) → reverse proxy
- frontend (port 3000) → React SPA (internal)
- backend (port 5000) → Express API (internal)
- postgres → Database (internal)

---

## 🚀 What YOU Need to Do

### Step 1: Get OCI Auth Token

```
OCI Console → My Profile (top-right) → Auth Tokens → Generate Token
Copy the token (appears only once!)
```

### Step 2: Add 8 GitHub Secrets

**GitHub Repo → Settings → Secrets and variables → Actions → New repository secret**

Add these 8 secrets:

```
OCIR_REGISTRY        = bom.ocir.io
OCIR_USERNAME        = your-namespace/your@email.com
OCIR_TOKEN           = <token from Step 1>
OCIR_REPO            = your-namespace/crudapp
OCI_HOST             = your-vm-public-ip
OCI_USER             = ubuntu
OCI_SSH_PRIVATE_KEY  = <run: cat ~/.ssh/id_rsa>
DB_PASSWORD          = <strong-password>
```

### Step 3: Set Up OCI VM

SSH into your OCI machine:

```bash
# Install Docker + Compose
sudo apt update && sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker ubuntu
newgrp docker

# Create crudapp directory (separate from your other projects)
mkdir -p /home/ubuntu/crudapp
cd /home/ubuntu/crudapp

# Download docker-compose.yml from GitHub
wget https://raw.githubusercontent.com/YOUR-USERNAME/YOUR-REPO/main/docker-compose.yml

# Create .env file (values must match GitHub secrets)
cat > .env <<'EOF'
DB_NAME=crudapp
DB_USER=cruduser
DB_PASSWORD=same-as-github-secret

OCIR_REGISTRY=bom.ocir.io
OCIR_REPO=your-namespace/crudapp
TAG=latest
EOF
```

### Step 4: Open Port 80 in OCI

1. OCI Console → VCN → Subnet → Security List
2. Add Ingress Rule:
   - Source CIDR: `0.0.0.0/0`
   - Destination Port: `80`
   - Protocol: `TCP`

### Step 5: Test SSH Access

```bash
# From your local machine
ssh ubuntu@your-vm-ip "docker ps"
# Should work WITHOUT asking for password
```

### Step 6: Push to Main

```bash
git add .
git commit -m "Add CI/CD pipeline"
git push origin main
```

**What happens:**
1. GitHub Actions detects the push
2. Builds 3 images (backend, frontend, nginx)
3. Pushes to OCIR
4. SSHes into OCI VM
5. Pulls images
6. Restarts containers
7. App is LIVE at `http://your-vm-public-ip`

---

## 🎯 Architecture: Separate nginx

**Why separate?**
- ✅ Clean separation of concerns
- ✅ nginx can be updated independently
- ✅ Standard production pattern
- ✅ Works great with existing infrastructure
- ✅ Easier to scale/manage

**Services:**
```
nginx (port 80, public)
  ├─ Routes / → frontend:3000
  ├─ Routes /api/* → backend:5000
  └─ Routes /health → backend:5000

frontend (port 3000, internal) - React SPA
backend (port 5000, internal) - Express API
postgres (internal) - Database
```

---

## 📁 File Structure

```
root/
├── docker-compose.yml              ← Orchestration (4 services)
├── .env.example                    ← Template
├── .gitignore
├── README.md
├── DEPLOYMENT.md
├── SETUP_CHECKLIST.md             ← This file
├── .github/
│   └── workflows/
│       └── deploy.yml             ← Builds 3 images
├── backend/
│   ├── Dockerfile
│   ├── index.js
│   ├── setup.js
│   └── ... (other files)
├── frontend/
│   ├── Dockerfile                 ← React build + serve
│   ├── vite.config.js
│   ├── src/
│   └── ... (other files)
└── nginx/
    ├── Dockerfile                 ← Nginx reverse proxy
    └── nginx.conf                 ← Routes configuration
```

---

## ✨ After Setup is Complete

Every time you `git push origin main`:

1. ✅ GitHub Actions triggers automatically
2. ✅ Builds backend, frontend, nginx images
3. ✅ Pushes all 3 to OCIR
4. ✅ SSHes into OCI VM
5. ✅ Pulls new images
6. ✅ Restarts containers
7. ✅ App updates live (no downtime)

**Total time:** ~5-10 minutes from push to live.

---

## 🆘 Quick Troubleshooting

**GitHub Actions fails?**
- Check secrets: ensure all 8 are set correctly
- Check SSH key: includes `-----BEGIN PRIVATE KEY-----`

**App not starting?**
- Check logs: `docker compose logs nginx`
- Check .env: `cat /home/ubuntu/crudapp/.env`
- Check disk: `df -h`

**Can't reach app?**
- Check port 80 open: OCI Security List
- Check nginx running: `docker ps | grep nginx`
- Test: `curl http://your-vm-ip/`

---

## 📚 Documentation Order

1. **README.md** — Overview
2. **SETUP_CHECKLIST.md** — This file (setup steps)
3. **DEPLOYMENT.md** — Detailed explanation

---

## 🎉 Ready!

Follow the 6 steps above and you have:
- ✅ Fully automated CI/CD
- ✅ 3 Docker images built on every push
- ✅ Auto-deployment
- ✅ Separate nginx reverse proxy
- ✅ Zero-downtime updates

Good luck! 🚀
