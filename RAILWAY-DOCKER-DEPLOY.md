# 🚂 Railway Docker Deployment Guide

## 📋 Fajlovi za Deployment

Kreirani su sljedeći fajlovi optimizovani za Railway deployment:

### 1. **Dockerfile.railway**
Optimizovan Docker image za production:
- ✅ Multi-stage build (mali image size)
- ✅ Non-root user (security)
- ✅ Dumb-init (proper signal handling)
- ✅ Health checks
- ✅ Railway-compatible PORT binding

### 2. **railway.json**
Glavna Railway konfiguracija:
- Koristi Docker builder
- Pokazuje na `Dockerfile.railway`
- Postavlja health check
- Restart policy

### 3. **railway.toml**
Alternativna konfiguracija (ista kao railway.json):
- TOML format
- Iste postavke

### 4. **.dockerignore**
Exclude nepotrebnih fajlova iz build-a

## 🚀 Deployment Options

### Opcija 1: Via GitHub (Preporučeno - Auto Deploy)

#### Step 1: Push na GitHub
```bash
git add Dockerfile.railway railway.json railway.toml
git commit -m "Add Railway Docker deployment configuration"
git push origin main
```

#### Step 2: Connect sa Railway

1. **Login na Railway:**
   ```
   https://railway.app
   ```

2. **New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Izaberite `atomic-habits` repository
   - Railway će automatski detektovati `railway.json`

3. **Environment Variables:**
   Railway automatski postavlja:
   - `PORT` - Railway bira port (8080, 3000, etc.)
   - `NODE_ENV=production` - Setovan u Dockerfile-u

4. **Deploy:**
   - Click "Deploy"
   - Railway će build-ovati Docker image
   - Deploy će početi automatski

#### Step 3: Add Volume za Database (Opciono)

```bash
# Via Railway Dashboard
Settings → Volumes → Add Volume
Mount Path: /app/data
```

**Ili via CLI:**
```bash
railway volumes add data --mount-path /app/data
```

### Opcija 2: Via Railway CLI (Manual)

#### Step 1: Install Railway CLI
```bash
# macOS
brew install railway

# npm
npm install -g @railway/cli
```

#### Step 2: Login
```bash
railway login
```

#### Step 3: Initialize Project
```bash
cd /Users/fahro/Documents/softprojects/atomic-habits
railway init
```

#### Step 4: Link Project
```bash
railway link
```

#### Step 5: Deploy
```bash
railway up
```

Railway će:
1. ✅ Pročitati `railway.json`
2. ✅ Build-ovati `Dockerfile.railway`
3. ✅ Deploy-ovati container
4. ✅ Assign URL

### Opcija 3: Docker Image Push (Advanced)

#### Build lokalno:
```bash
docker build -f Dockerfile.railway -t atomic-habits:railway .
```

#### Tag za Railway:
```bash
docker tag atomic-habits:railway registry.railway.app/atomic-habits:latest
```

#### Push:
```bash
docker push registry.railway.app/atomic-habits:latest
```

## 🔧 Railway Configuration Details

### railway.json Explained

```json
{
  "build": {
    "builder": "DOCKERFILE",           // Use Docker (not Nixpacks)
    "dockerfilePath": "Dockerfile.railway" // Custom Dockerfile
  },
  "deploy": {
    "numReplicas": 1,                   // Single instance
    "restartPolicyType": "ON_FAILURE",  // Restart on crash
    "restartPolicyMaxRetries": 10,      // Max 10 restarts
    "healthcheckPath": "/api/health",   // Health endpoint
    "healthcheckTimeout": 100           // 100ms timeout
  }
}
```

### Dockerfile.railway Features

#### Security
```dockerfile
USER node  # Non-root user
```

#### Signal Handling
```dockerfile
ENTRYPOINT ["dumb-init", "--"]  # Proper SIGTERM handling
```

#### Health Check
```dockerfile
HEALTHCHECK --interval=30s \
  CMD node -e "require('http').get(...)"
```

#### Optimizacija
```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder  # Build stage
FROM node:18-alpine             # Production stage (smaller)
```

## 🗄️ Database Persistence

### Važno: Railway Ephemeral File System

Railway containers imaju ephemeral (privremeni) file system. 
**Database će se izgubiti nakon restart-a ako ne koristite Volume!**

### Rješenje: Add Volume

#### Via Dashboard:
1. Project Settings
2. Volumes
3. Add Volume
   - **Mount Path:** `/app/data`
   - **Size:** 1GB (dovoljan)

#### Via CLI:
```bash
railway volumes add data --mount-path /app/data
```

### Verifikacija:
```bash
railway logs

# Trebali biste vidjeti:
# 📁 Database location: /app/data/study-tracker.db
```

## 🌐 Environment Variables

Railway automatski postavlja:

| Variable | Value | Source |
|----------|-------|--------|
| `PORT` | 8080 (or other) | Railway auto |
| `NODE_ENV` | production | Dockerfile |
| `DATABASE_PATH` | /app/data | App default |

### Custom Variables (ako treba):

```bash
# Via CLI
railway variables set CUSTOM_VAR=value

# Via Dashboard
Settings → Variables → New Variable
```

## 📊 Monitoring

### Health Check
Railway koristi `/api/health` endpoint:

```bash
curl https://your-app.railway.app/api/health

# Response:
{
  "status": "ok",
  "timestamp": "2025-10-18T..."
}
```

### Logs
```bash
# Real-time logs
railway logs

# Last 100 lines
railway logs --tail 100
```

### Metrics
Railway Dashboard → Metrics:
- CPU usage
- Memory usage
- Network
- Requests

## 🔄 Redeploy

### Auto-deploy (GitHub connected):
```bash
git push origin main
# Railway automatski re-deploy-uje
```

### Manual redeploy:
```bash
railway up --detach
```

### Rollback:
```bash
# Via Dashboard
Deployments → Select previous → Rollback
```

## 🧪 Testing Deployment

### Pre-deployment (lokalno):

```bash
# Build Railway Dockerfile
docker build -f Dockerfile.railway -t atomic-habits:test .

# Run locally
docker run -p 3001:3001 -e PORT=3001 atomic-habits:test

# Test
curl http://localhost:3001/api/health
```

### Post-deployment (Railway):

```bash
# Get app URL
railway domain

# Test health
curl https://your-app.railway.app/api/health

# Test API
curl https://your-app.railway.app/api/users

# Test webhook
curl -X POST https://your-app.railway.app/api/webhook/message \
  -H "Content-Type: application/json" \
  -d '{"author":"Test","content":"Test 30m"}'
```

## 🐛 Troubleshooting

### Problem: Build Failed

**Check logs:**
```bash
railway logs --deployment
```

**Common issues:**
- Dependencies not installed → Check `package.json`
- Build command failed → Check `npm run build`
- Out of memory → Reduce build parallelism

### Problem: App Not Starting

**Check:**
```bash
railway logs
```

**Common issues:**
- Port binding → Ensure `0.0.0.0` in `server/index.js`
- Database permissions → Check volume mount
- Environment variables → Check `railway variables`

### Problem: Database Lost After Restart

**Solution:** Add Volume!
```bash
railway volumes add data --mount-path /app/data
```

### Problem: 502 Bad Gateway

**Causes:**
- App crashed → Check logs
- Health check failing → Test `/api/health`
- PORT mismatch → Ensure app reads `process.env.PORT`

**Fix:**
```bash
# Check if app is listening
railway logs | grep "Server running"

# Should see:
# 🚀 Server running on http://0.0.0.0:8080
```

## 📈 Performance Optimization

### 1. Image Size

Current: ~150MB (with alpine)

**Further optimization:**
```dockerfile
# Remove dev dependencies
RUN npm ci --production

# Clean cache
RUN npm cache clean --force
```

### 2. Build Speed

**Use BuildKit:**
```bash
DOCKER_BUILDKIT=1 docker build -f Dockerfile.railway .
```

**Layer caching:**
- Dependencies copied before source
- Leverages Docker cache

### 3. Runtime Performance

**Node.js optimizations:**
```bash
NODE_ENV=production  # Already set
```

**Database:**
- Use WAL mode (already configured)
- Regular VACUUM (add cron if needed)

## 🔐 Security Best Practices

### ✅ Already Implemented:

- Non-root user (`USER node`)
- Multi-stage build (no build tools in production)
- Minimal base image (alpine)
- Signal handling (dumb-init)
- Health checks

### 🔒 Additional Recommendations:

1. **API Rate Limiting:**
   ```bash
   npm install express-rate-limit
   ```

2. **Helmet for security headers:**
   ```bash
   npm install helmet
   ```

3. **Environment secrets:**
   ```bash
   railway variables set API_KEY=secret
   ```

## 📝 Deployment Checklist

Before deploying to Railway:

- [ ] `Dockerfile.railway` exists
- [ ] `railway.json` configured
- [ ] `.dockerignore` updated
- [ ] All code pushed to GitHub
- [ ] Railway project created
- [ ] Volume added for `/app/data`
- [ ] Health check endpoint working
- [ ] Environment variables set (if any)
- [ ] Local Docker build successful
- [ ] Tests passing

## 🚦 Quick Start Summary

```bash
# 1. Push code
git add .
git commit -m "Railway Docker deployment ready"
git push

# 2. Deploy via Railway CLI
railway login
railway link
railway up

# 3. Add volume
railway volumes add data --mount-path /app/data

# 4. Check deployment
railway logs
railway domain

# 5. Test
curl https://your-app.railway.app/api/health
```

## 🎯 Next Steps

1. **Setup CI/CD:** GitHub Actions for automated testing
2. **Monitoring:** Add Sentry or LogRocket
3. **Backups:** Schedule database backups
4. **Custom Domain:** Add your own domain via Railway
5. **Staging Environment:** Create separate Railway project for staging

---

**Railway Docker deployment je sada potpuno konfigurisan! 🚂✅**

**Files created:**
- ✅ `Dockerfile.railway` - Production-optimized Docker image
- ✅ `railway.json` - Railway configuration
- ✅ `railway.toml` - Alternative config format
- ✅ This guide - Complete deployment documentation

**Deploy komanda:**
```bash
railway up
```

Good luck! 🚀
