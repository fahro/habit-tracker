# 🚀 Deployment Guide

Kompletni vodič za deployment Study Tracker aplikacije na različite platforme.

## 📋 Pre-Deployment Checklist

- [ ] Testirano lokalno sa Docker-om
- [ ] Environment varijable postavljene
- [ ] Database backup (ako postoji)
- [ ] Dokumentacija pregledana

## 1️⃣ Railway (Najlakše - Preporučeno)

Railway automatski detektuje Dockerfile i konfiguraciju.

### Koraci:

1. **Push na GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit with multi-user support"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy na Railway:**
   - Idite na [railway.app](https://railway.app)
   - Kliknite "New Project"
   - Izaberite "Deploy from GitHub repo"
   - Autorizujte GitHub i izaberite repository
   - Railway će automatski:
     - Detektovati Dockerfile
     - Build-ovati aplikaciju
     - Deployovati na production URL

3. **Konfiguracija:**
   - Railway automatski postavlja `PORT` environment varijablu
   - Možete dodati dodatne environment varijable u Settings

4. **Database Persistence:**
   - Railway automatski montira volume za `/app/data`
   - Vaša baza će biti persistent između deploya

5. **Custom Domain (opciono):**
   - Settings → Domains → Add Custom Domain
   - Pratite instrukcije za DNS konfiguraciju

### Railway Commands

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up

# View logs
railway logs
```

## 2️⃣ Docker Registry (DigitalOcean, AWS, etc.)

### Build i Push Image:

```bash
# Login to registry
docker login registry.digitalocean.com

# Build image
docker build -t registry.digitalocean.com/your-registry/study-tracker:latest .

# Push image
docker push registry.digitalocean.com/your-registry/study-tracker:latest
```

### Na Serveru:

```bash
# Pull image
docker pull registry.digitalocean.com/your-registry/study-tracker:latest

# Run container
docker run -d \
  --name study-tracker \
  -p 3001:3001 \
  -v $(pwd)/data:/app/data \
  -e NODE_ENV=production \
  registry.digitalocean.com/your-registry/study-tracker:latest

# Check logs
docker logs -f study-tracker
```

## 3️⃣ Docker Compose na VPS

### Na serveru (Ubuntu/Debian):

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo apt-get install docker-compose

# Clone repository
git clone <your-repo-url>
cd atomic-habits

# Start application
docker-compose up -d

# View logs
docker-compose logs -f

# Update aplikacije
git pull
docker-compose down
docker-compose build
docker-compose up -d
```

### Nginx Reverse Proxy (opciono):

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 4️⃣ Heroku

### Priprema:

Kreirajte `heroku.yml`:
```yaml
build:
  docker:
    web: Dockerfile
run:
  web: node server/index.js
```

### Deployment:

```bash
# Login
heroku login

# Create app
heroku create your-app-name

# Set stack to container
heroku stack:set container

# Deploy
git push heroku main

# Open app
heroku open

# View logs
heroku logs --tail
```

## 5️⃣ Vercel/Netlify (Samo Frontend -需 odvojeni backend)

Ove platforme su optimizovane za static/serverless aplikacije i nisu idealne za ovaj full-stack app sa SQLite bazom.

**Alternativa:** Deploy frontend na Vercel/Netlify, backend na Railway/Heroku.

## 🔐 Environment Variables

### Production Variables:

```bash
NODE_ENV=production
PORT=3001  # Obično automatski postavljen
```

### Postavljanje na Railway:
1. Project Settings → Variables
2. Dodajte varijable
3. Automatski restart

### Postavljanje na serveru:
```bash
# Create .env file
echo "NODE_ENV=production" > .env
echo "PORT=3001" >> .env

# Docker Compose automatski učitava .env
```

## 📊 Database Management

### Backup na Production:

```bash
# Railway
railway run bash
cd /app/data
cat study-tracker.db | base64

# VPS
docker exec study-tracker cat /app/data/study-tracker.db > backup.db
```

### Restore na Production:

```bash
# Railway
railway run bash
cd /app/data
echo "<base64-data>" | base64 -d > study-tracker.db

# VPS
docker cp backup.db study-tracker:/app/data/study-tracker.db
docker restart study-tracker
```

### Automatski Backup Script:

```bash
#!/bin/bash
# backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
docker exec study-tracker cat /app/data/study-tracker.db > backup_$DATE.db
echo "Backup created: backup_$DATE.db"

# Keep only last 7 backups
ls -t backup_*.db | tail -n +8 | xargs rm -f
```

Dodajte u crontab:
```bash
# Backup every day at 3 AM
0 3 * * * /path/to/backup-db.sh
```

## 🔍 Monitoring & Health Checks

### Health Check Endpoint:

```bash
curl https://your-app.railway.app/api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-17T21:00:00.000Z"
}
```

### Uptime Monitoring:

Koristite servise kao:
- [UptimeRobot](https://uptimerobot.com) - Besplatan
- [Pingdom](https://www.pingdom.com)
- [StatusCake](https://www.statuscake.com)

## 🐛 Troubleshooting

### Problem: Application won't start

**Check logs:**
```bash
# Railway
railway logs

# Docker
docker-compose logs

# Heroku
heroku logs --tail
```

### Problem: Database not persisting

**Railway:** Provjerite da li je volume mountovan
```bash
railway run ls -la /app/data
```

**Docker:** Provjerite volume u docker-compose.yml
```yaml
volumes:
  - ./data:/app/data
```

### Problem: Port already in use

**Promijenite port** u docker-compose.yml:
```yaml
ports:
  - "8080:3001"  # Host:Container
```

### Problem: Build failing

**Provjerite:**
1. Node.js verzija (trebalo bi Node 18)
2. Dependencies u package.json
3. Dockerfile sintaksa
4. Build logs za specifične greške

## 📱 Post-Deployment

### 1. Testirajte Webhook:

```bash
curl -X POST https://your-app.railway.app/api/webhook/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Fahro:\nTest Game\n25m"
  }'
```

### 2. Kreirajte Test Korisnike:

```bash
curl -X POST https://your-app.railway.app/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "username": "TestUser",
    "message": "Game 1\n30m"
  }'
```

### 3. Provjerite Dashboard:

Otvorite `https://your-app.railway.app` u browseru

### 4. Setup Viber/WhatsApp Integracija:

- Koristite Zapier/Make za no-code integraciju
- Webhook URL: `https://your-app.railway.app/api/webhook/message`

## 🎯 Production Best Practices

1. **Redovni Backups** - Automatski svaki dan
2. **Monitoring** - Setup uptime checks
3. **Environment Variables** - Nikad hardcode secrets
4. **Logs** - Pregledajte logs redovno
5. **Updates** - Održavajte dependencies up-to-date
6. **Security** - HTTPS obavezan (Railway automatski)
7. **Rate Limiting** - Razmislite o implementaciji za webhook
8. **Database Size** - Monitorirajte rast baze

## 💰 Pricing Estimates

### Railway
- **Hobby Plan:** $5/month
- **Pro Plan:** $20/month
- Includes: 500 GB bandwidth, persistent volumes

### DigitalOcean
- **Droplet:** $6-12/month (1-2 GB RAM)
- **Container Registry:** Besplatan

### Heroku
- **Hobby Dyno:** $7/month
- **Professional:** $25-50/month

### VPS (Vultr, Linode, Hetzner)
- **Budget:** $3-5/month
- **Recommended:** $10-15/month

---

**Sretno sa deployment-om! 🚀**

Za pomoć ili pitanja, pogledajte dokumentaciju ili kreirajte GitHub Issue.
