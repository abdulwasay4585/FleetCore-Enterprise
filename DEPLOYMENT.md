# FleetCore Enterprise — Free $0 Deployment Guide

> **Target audience**: Solo developer or small team deploying FleetCore Enterprise on a $0 budget using exclusively free-tier cloud services.
> **Last updated**: September 2026

---

## Stack Overview

| Service | Technology | Free Host |
|---|---|---|
| **Frontend** | Next.js 13 (App Router) | Vercel (Hobby — free forever) |
| **Core API** | Spring Boot 3.1 / Java 17 | Railway (500 hr/mo free) |
| **Go Ingestion Server** | Go 1.21 | Railway (second free service) |
| **Python AI Sidecar** | Python 3.11 (FastAPI/stdlib) | Railway (third free service) |
| **PostgreSQL 16** | Postgres + TimescaleDB schema | Neon.tech (free tier, 512 MB) |
| **Redis 7** | Cache + rate-limiting | Upstash Redis (free, 10k req/day) |
| **Kafka** | Telemetry stream | Upstash Kafka (free, 10k msg/day) |
| **CI/CD** | GitHub Actions | GitHub (free for public repos) |

> **Cost**: $0/month on all free tiers. Upgrade paths are documented at the bottom.

---

## Prerequisites

Install these tools on your local machine before starting:

```bash
# Node.js 20+
node --version   # v20.x.x

# Java 17+
java --version   # openjdk 17.x.x

# Maven 3.9+
mvn --version    # Apache Maven 3.9.x

# Go 1.21+
go version       # go1.21.x

# Docker + Docker Compose (for local testing)
docker --version          # 24.x.x
docker compose version    # v2.x.x

# Railway CLI
npm install -g @railway/cli
railway --version

# Vercel CLI
npm install -g vercel
vercel --version
```

---

## Part 1 — Local Development Setup

### 1.1 Clone & Configure Environment

```bash
git clone https://github.com/YOUR_USERNAME/fleetcore-enterprise.git
cd fleetcore-enterprise

# Copy root environment template
cp .env.example .env

# Copy frontend environment template
cp frontend/.env.example frontend/.env.local
```

### 1.2 Edit `.env` — Change ALL Placeholders

Open `.env` and update every `CHANGE_ME_*` value:

```env
POSTGRES_PASSWORD=YourSuperStrongPassword2026!   # Min 20 chars
JWT_SECRET=YourMinimum32CharacterJWTSigningKey!   # Min 32 chars
ERP_WEBHOOK_SECRET=YourErpWebhookSecret2026!
```

### 1.3 Start All Services Locally (Docker Compose)

```bash
cd infrastructure

# First run — builds all Docker images (~5–10 minutes)
docker compose --env-file ../.env up --build

# Subsequent runs (images already built)
docker compose --env-file ../.env up
```

**Expected healthy services:**

| Container | Port | Verify |
|---|---|---|
| fleetcore-postgres | 5433 | `psql -h localhost -p 5433 -U fleetcore_admin -d fleetcore_db` |
| fleetcore-redis | 6380 | `redis-cli -p 6380 ping` → `PONG` |
| fleetcore-kafka | 9093 | — |
| fleetcore-ai-sidecar | 8098 | `curl http://localhost:8098/health` |
| fleetcore-ingestion-go | 8080 | `curl http://localhost:8080/health` |
| fleetcore-api-spring | 8081 | `curl http://localhost:8081/actuator/health` |
| fleetcore-frontend-next | 3000 | `http://localhost:3000` |

---

## Part 2 — Database: Neon.tech (Free PostgreSQL)

Neon provides serverless PostgreSQL — 512 MB, 1 vCPU, branching. Free with no credit card.

### 2.1 Create Neon Project

1. Go to **https://neon.tech** → Sign up with GitHub.
2. **New Project** → Name: `fleetcore-production`.
3. Region: closest to you. PostgreSQL version: **16**.
4. Click **Create Project**.

### 2.2 Copy Connection String

Dashboard → **Connection Details** → copy the string:
```
postgresql://fleetcore_admin:AbCdEf123@ep-wild-sun-123456.us-east-2.aws.neon.tech/fleetcore_db?sslmode=require
```

### 2.3 Apply Schema

```bash
# Ubuntu/Debian
sudo apt install postgresql-client

# macOS
brew install libpq && brew link --force libpq

# Apply schema
psql "postgresql://USER:PASS@HOST/fleetcore_db?sslmode=require" -f database/schema.sql

# Apply seed data (optional)
psql "postgresql://USER:PASS@HOST/fleetcore_db?sslmode=require" -f database/seed.sql
```

> **Note**: TimescaleDB hypertables are not available on Neon free tier. The schema uses standard PostgreSQL `TIMESTAMPTZ` columns as a fallback — all queries work correctly.

---

## Part 3 — Redis: Upstash (Free Serverless Redis)

10,000 commands/day free — sufficient for rate-limiting and session caching.

### 3.1 Create Upstash Redis

1. Go to **https://upstash.com** → Sign up with GitHub.
2. **Create Database** → Redis → Name: `fleetcore-cache`.
3. Enable **TLS** (toggle ON).
4. Copy the **Redis URL**: `rediss://default:PASS@us1-abc-12345.upstash.io:6379`

### 3.2 Extract Variables for Spring Boot

| Variable | Extracted value |
|---|---|
| `SPRING_DATA_REDIS_HOST` | `us1-abc-12345.upstash.io` |
| `SPRING_DATA_REDIS_PORT` | `6379` |
| `SPRING_DATA_REDIS_PASSWORD` | `YOUR_PASSWORD` |
| `SPRING_DATA_REDIS_SSL` | `true` |

---

## Part 4 — Kafka: Upstash Kafka (Free)

10,000 messages/day free.

### 4.1 Create Kafka Cluster

1. Upstash dashboard → **Kafka** → **Create Cluster**.
2. Name: `fleetcore-stream`. Region: match your Redis region.
3. Create topic: `telemetry.raw`, Partitions: 1, Retention: 1 day.
4. Copy **Bootstrap Servers** URL and **SASL credentials**.

### 4.2 Kafka Environment Variables

| Variable | Value |
|---|---|
| `KAFKA_BOOTSTRAP_SERVERS` | `flowing-cardinal-12345.upstash.io:9092` |
| `KAFKA_SASL_USERNAME` | From Upstash dashboard |
| `KAFKA_SASL_PASSWORD` | From Upstash dashboard |
| `KAFKA_SECURITY_PROTOCOL` | `SASL_SSL` |
| `KAFKA_SASL_MECHANISM` | `SCRAM-SHA-256` |

---

## Part 5 — Railway Backend Deployment

Railway gives **500 free compute hours/month**. Services auto-sleep when idle, keeping usage low.

### 5.1 Login & Initialize

```bash
railway login     # Opens browser — authenticate with GitHub
cd fleetcore-enterprise
railway init      # Create new project: "fleetcore-enterprise"
```

### 5.2 Deploy Python AI Sidecar (deploy first — no dependencies)

```bash
cd emulators
railway up --service ai-sidecar
railway variables set AI_SIDECAR_PORT="8098" ENVIRONMENT="production" --service ai-sidecar
```

Save the Railway URL: `https://ai-sidecar-production-xxxx.up.railway.app`

### 5.3 Deploy Go Ingestion Server

```bash
cd ../ingestion-server
railway up --service ingestion-server
railway variables set \
  KAFKA_BROKER="YOUR_UPSTASH_KAFKA_BOOTSTRAP" \
  KAFKA_SASL_USERNAME="YOUR_KAFKA_USER" \
  KAFKA_SASL_PASSWORD="YOUR_KAFKA_PASS" \
  KAFKA_TOPIC="telemetry.raw" \
  --service ingestion-server
```

> **Note**: Railway only exposes HTTP publicly on free tier. Configure devices to send telemetry via HTTP POST instead of raw TCP/UDP.

### 5.4 Deploy Core API (Spring Boot)

```bash
cd ../core-api
railway up --service core-api
railway variables set \
  SPRING_DATASOURCE_URL="jdbc:postgresql://ep-HOST.neon.tech/fleetcore_db?sslmode=require" \
  SPRING_DATASOURCE_USERNAME="fleetcore_admin" \
  SPRING_DATASOURCE_PASSWORD="YOUR_NEON_PASSWORD" \
  SPRING_DATA_REDIS_HOST="us1-abc.upstash.io" \
  SPRING_DATA_REDIS_PORT="6379" \
  SPRING_DATA_REDIS_PASSWORD="YOUR_UPSTASH_REDIS_PASS" \
  SPRING_DATA_REDIS_SSL="true" \
  KAFKA_BOOTSTRAP_SERVERS="YOUR_UPSTASH_KAFKA_BOOTSTRAP" \
  KAFKA_SASL_USERNAME="YOUR_KAFKA_USER" \
  KAFKA_SASL_PASSWORD="YOUR_KAFKA_PASS" \
  JWT_SECRET="YOUR_MINIMUM_32_CHAR_SECRET_HERE" \
  AI_SIDECAR_URL="https://ai-sidecar-xxxx.up.railway.app/api/v1/stretch/ai" \
  CORS_ALLOWED_ORIGINS="https://your-app.vercel.app" \
  ENVIRONMENT="production" \
  --service core-api
```

---

## Part 6 — Frontend: Vercel (Free Forever)

Vercel Hobby: unlimited projects, 100 GB bandwidth/month, Edge CDN — free, no credit card.

### 6.1 Import on Vercel Dashboard

1. Go to **https://vercel.com** → Sign in with GitHub.
2. **Add New Project** → Import your repo.
3. **Root Directory**: set to `frontend`.
4. Framework: **Next.js** (auto-detected).
5. Add **Environment Variables**:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://core-api-xxxx.up.railway.app` |
| `NEXT_PUBLIC_WS_URL` | `wss://core-api-xxxx.up.railway.app/ws/telemetry` |
| `NEXT_PUBLIC_AI_SIDECAR_URL` | `https://ai-sidecar-xxxx.up.railway.app` |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | *(leave blank for fallback grid)* |

6. Click **Deploy**.

### 6.2 Update CORS After Getting Vercel URL

Once deployed (e.g., `https://fleetcore.vercel.app`), update Railway Core API:

```bash
railway variables set \
  CORS_ALLOWED_ORIGINS="https://fleetcore.vercel.app" \
  --service core-api
```

---

## Part 7 — CI/CD: GitHub Actions (Free)

2,000 minutes/month free for private repos. Unlimited for public repos.

### 7.1 Add GitHub Secrets

Repository → **Settings** → **Secrets and Variables** → **Actions**:

| Secret | Value |
|---|---|
| `VERCEL_TOKEN` | https://vercel.com/account/tokens |
| `VERCEL_ORG_ID` | From `vercel link` output |
| `VERCEL_PROJECT_ID` | From `vercel link` output |
| `RAILWAY_TOKEN` | From `railway tokens create` |

### 7.2 Create Workflow File

Create `.github/workflows/deploy.yml`:

```yaml
name: FleetCore Enterprise — CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  frontend-build:
    name: Build & Deploy Frontend
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      - run: npm ci
      - run: npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ vars.NEXT_PUBLIC_API_URL }}
          NEXT_PUBLIC_WS_URL: ${{ vars.NEXT_PUBLIC_WS_URL }}
          NEXT_PUBLIC_MAPBOX_TOKEN: ''
      - name: Deploy to Vercel
        if: github.ref == 'refs/heads/main'
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: frontend
          vercel-args: '--prod'

  core-api-build:
    name: Build Core API
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: core-api
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: maven
      - run: mvn clean package -DskipTests

  ai-sidecar-build:
    name: Validate Python Sidecar
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: python -m py_compile emulators/stretch_ai_math_service.py
```

---

## Part 8 — Security Pre-Launch Checklist

Before going live, confirm every item:

- [ ] `.env` and `frontend/.env.local` are in `.gitignore` (already configured)
- [ ] No hardcoded secrets in source files:
  ```bash
  grep -rn "CHANGE_ME\|password123\|secret123" \
    --include="*.java" --include="*.go" --include="*.py" \
    --include="*.jsx" --include="*.ts" .
  ```
- [ ] `JWT_SECRET` is at least 32 characters
- [ ] `POSTGRES_PASSWORD` is at least 20 characters with symbols
- [ ] `CORS_ALLOWED_ORIGINS` is your exact Vercel URL — not `*`
- [ ] All `NEXT_PUBLIC_*` vars contain only URLs, never passwords or tokens
- [ ] Railway service ports for Postgres/Redis are NOT publicly exposed (default behaviour)
- [ ] Neon database requires SSL (`?sslmode=require` in connection string)

---

## Part 9 — Post-Deployment Health Checks

```bash
# 1. Core API
curl https://core-api-xxxx.up.railway.app/actuator/health
# → {"status":"UP"}

# 2. AI Sidecar
curl https://ai-sidecar-xxxx.up.railway.app/health
# → {"status":"healthy"}

# 3. Frontend
curl -I https://your-app.vercel.app
# → HTTP/2 200

# 4. Authentication
curl -X POST https://core-api-xxxx.up.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fleetcore.io","password":"YOUR_ADMIN_PASS"}'
# → {"token":"eyJhbGc..."}

# 5. WebSocket (browser console)
const ws = new WebSocket('wss://core-api-xxxx.up.railway.app/ws/telemetry');
ws.onopen = () => console.log('Connected');
```

---

## Part 10 — Free Tier Limits & Workarounds

### Railway (500 hr/month)
- 3 services × ~5 active hrs/day = ~465 hrs/month — just fits.
- Services auto-sleep after 30 min of inactivity.
- **Workaround**: Use UptimeRobot pings every 25 min only during business hours to prevent cold-start latency without burning all hours.

### Neon (512 MB storage)
- Prune old telemetry with a weekly GitHub Actions cron:
```yaml
# .github/workflows/prune.yml
on:
  schedule:
    - cron: '0 2 * * 0'
jobs:
  prune:
    runs-on: ubuntu-latest
    steps:
      - run: |
          psql "${{ secrets.NEON_DATABASE_URL }}" \
            -c "DELETE FROM telemetry_events WHERE created_at < NOW() - INTERVAL '30 days';"
```

### Upstash Kafka (10k msgs/day)
- **Workaround**: Batch telemetry — aggregate 10-second windows server-side before publishing to Kafka.

### Vercel — Custom Domain
- Free Hobby plan gives `*.vercel.app` — add a custom domain free via Cloudflare proxy:
  1. Add domain to Cloudflare (free plan).
  2. Set CNAME → `cname.vercel-dns.com` (Proxied).
  3. Add domain in Vercel dashboard → verified automatically.

---

## Part 11 — Free Monitoring Stack

| Tool | Purpose | URL |
|---|---|---|
| **UptimeRobot** | Uptime checks (50 monitors, 5-min intervals) | https://uptimerobot.com |
| **Railway Logs** | Real-time logs, 7-day retention | Railway Dashboard |
| **Sentry** | Error tracking (5k errors/month) | https://sentry.io |
| **Vercel Analytics** | Frontend performance metrics | Built-in, Vercel dashboard |

---

## Part 12 — Exact Deployment Order

Follow this sequence to avoid dependency failures:

```
Step 1.  Create Neon database project
Step 2.  Apply database/schema.sql to Neon
Step 3.  Apply database/seed.sql to Neon (optional)
Step 4.  Create Upstash Redis cluster
Step 5.  Create Upstash Kafka cluster + topic: telemetry.raw
Step 6.  Deploy Python AI Sidecar to Railway  ← no upstream dependencies
Step 7.  Deploy Go Ingestion Server to Railway ← depends on Kafka
Step 8.  Deploy Spring Boot Core API to Railway ← depends on Neon, Redis, Kafka, Sidecar
Step 9.  Deploy Next.js Frontend to Vercel
Step 10. Update CORS_ALLOWED_ORIGINS on Core API with Vercel production URL
Step 11. Run all health checks (Part 9)
Step 12. Set up UptimeRobot monitors for all 4 service URLs
Step 13. (Optional) Configure custom domain via Cloudflare
```

---

## Quick Reference: All Free Service Sign-Up URLs

| Service | URL | Free tier |
|---|---|---|
| Vercel | https://vercel.com | Unlimited Hobby, 100 GB BW/month |
| Railway | https://railway.app | 500 compute hours/month |
| Neon | https://neon.tech | 512 MB PostgreSQL, DB branching |
| Upstash | https://upstash.com | 10k Redis cmds/day + 10k Kafka msgs/day |
| Cloudflare | https://cloudflare.com | Free CDN, DDoS, DNS, SSL |
| UptimeRobot | https://uptimerobot.com | 50 monitors, 5-min checks |
| Sentry | https://sentry.io | 5k errors/month, 1 user |
| GitHub Actions | https://github.com | 2k min/month (private), unlimited (public) |

---

## Upgrade Path (When You Outgrow Free)

| Bottleneck | Upgrade option | Cost |
|---|---|---|
| Compute (>500 hr/mo) | Railway Starter | $5/month |
| DB storage (>512 MB) | Neon Launch | $19/month (10 GB) |
| Redis commands | Upstash Pay-as-you-go | ~$0.20/100k cmds |
| Kafka messages | Upstash Pay-as-you-go | ~$0.40/100k msgs |
| Custom domain on Vercel | Vercel Pro | $20/month |
| Full managed DB | Supabase Pro | $25/month |
