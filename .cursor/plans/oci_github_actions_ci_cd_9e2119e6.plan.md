---
name: OCI GitHub Actions CI/CD
overview: Containerize the Express backend and React frontend, push images to Oracle Container Image Registry (OCIR) via GitHub Actions, and auto-deploy to an OCI 1GB AMD VM using Docker Compose over SSH.
todos:
  - id: backend-dockerfile
    content: Create backend/Dockerfile (multi-stage, node:22-alpine)
    status: pending
  - id: nginx-conf
    content: Create frontend/nginx.conf (SPA fallback + /api proxy to backend:4010)
    status: pending
  - id: frontend-dockerfile
    content: Create frontend/Dockerfile (build stage + nginx serve stage)
    status: pending
  - id: docker-compose
    content: Create docker-compose.yml at project root (postgres + backend + frontend)
    status: pending
  - id: env-example
    content: Create .env.example at project root with all required variables
    status: pending
  - id: github-workflow
    content: Create .github/workflows/deploy.yml (build-and-push + SSH deploy jobs)
    status: pending
  - id: gitignore
    content: Create/update root .gitignore to exclude .env and dist/
    status: pending
  - id: vm-setup
    content: "One-time: install Docker on OCI VM, open port 80 in OCI Security List, mkdir DEPLOY_PATH"
    status: pending
isProject: false
---

# CI/CD Pipeline: GitHub Actions → OCIR → OCI VM

## Architecture on the VM

```mermaid
flowchart TD
    Internet -->|"port