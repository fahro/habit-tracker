# 🚂 Railway Docker Deployment - Quick Reference

## 📦 New Files Created

```
Dockerfile.railway          # Optimized production Dockerfile
railway.json               # Railway config (JSON format)
railway.toml               # Railway config (TOML format)
test-railway-docker.sh     # Local testing script
RAILWAY-DOCKER-DEPLOY.md   # Complete deployment guide
```

## ⚡ Quick Deploy

### Test Locally First
```bash
./test-railway-docker.sh
```

### Deploy to Railway
```bash
# Option 1: CLI
railway login
railway link
railway up

# Option 2: GitHub Auto-Deploy
git push origin main
# Railway auto-deploys
```

## 🔧 Essential Commands

### Railway CLI

```bash
# Login
railway login

# Link to project
railway link

# Deploy
railway up --detach

# View logs
railway logs
railway logs --tail 100

# View status
railway status

# Get app URL
railway domain

# Open in browser
railway open

# Environment variables
railway variables
railway variables set KEY=value

# Add volume
railway volumes add data --mount-path /app/data

# Restart
railway restart
```

### Docker Commands

```bash
# Build
docker build -f Dockerfile.railway -t atomic-habits:railway .

# Run locally
docker run -p 3001:3001 -e PORT=3001 atomic-habits:railway

# Check logs
docker logs <container-id>

# Stop
docker stop <container-id>

# Remove
docker rm <container-id>
```

## 🧪 Testing Endpoints

```bash
# Replace with your Railway URL
RAILWAY_URL="https://your-app.railway.app"

# Health check
curl $RAILWAY_URL/api/health

# Get users
curl $RAILWAY_URL/api/users

# Test webhook
curl -X POST $RAILWAY_URL/api/webhook/message \
  -H "Content-Type: application/json" \
  -d '{"author":"Test","content":"Test 30m"}'

# Get monthly settings
curl $RAILWAY_URL/api/settings/monthly

# Set monthly goal
curl -X POST $RAILWAY_URL/api/settings/monthly \
  -H "Content-Type: application/json" \
  -d '{"year":2025,"month":10,"dailyGoalMinutes":45}'
```

## 🐛 Troubleshooting

### App Not Starting
```bash
# Check logs
railway logs

# Common fixes:
# 1. Ensure PORT is read from env
# 2. Check if binding to 0.0.0.0
# 3. Verify health check endpoint
```

### Database Not Persisting
```bash
# Add volume
railway volumes add data --mount-path /app/data

# Verify
railway logs | grep "Database location"
```

### Build Failed
```bash
# Check build logs
railway logs --deployment

# Test locally first
./test-railway-docker.sh
```

### 502 Bad Gateway
```bash
# Check if app crashed
railway logs

# Restart
railway restart

# Check health
curl https://your-app.railway.app/api/health
```

## 📊 Key Files Explained

### Dockerfile.railway
- Multi-stage build (small image)
- Non-root user (secure)
- Health checks
- Signal handling (dumb-init)

### railway.json
- Specifies Docker builder
- Points to Dockerfile.railway
- Health check config
- Restart policy

### test-railway-docker.sh
- Builds Dockerfile locally
- Runs container
- Tests endpoints
- Shows resource usage

## 🎯 Deployment Checklist

```bash
# 1. Test locally
./test-railway-docker.sh

# 2. Commit changes
git add Dockerfile.railway railway.json railway.toml
git commit -m "Add Railway Docker deployment"
git push

# 3. Deploy to Railway
railway up

# 4. Add volume for database
railway volumes add data --mount-path /app/data

# 5. Verify
railway logs
railway domain
curl https://your-app.railway.app/api/health

# 6. Open app
railway open
```

## 🔗 Important URLs

- **Railway Dashboard:** https://railway.app
- **Railway Docs:** https://docs.railway.app
- **Project Settings:** Railway Dashboard → Your Project → Settings
- **Deployments:** Railway Dashboard → Your Project → Deployments
- **Metrics:** Railway Dashboard → Your Project → Metrics

## 💾 Database Volume

**CRITICAL:** Railway has ephemeral filesystem!

```bash
# Add volume for persistence
railway volumes add data --mount-path /app/data
```

Without volume, database is lost on restart!

## 🚀 Auto-Deploy Setup

### GitHub Integration

1. Railway Dashboard → Project → Settings
2. Connect GitHub Repository
3. Select branch (main)
4. Enable auto-deploy

Now every `git push` triggers deploy!

## 📈 Monitoring

```bash
# Live logs
railway logs -f

# Metrics
# Go to Dashboard → Metrics

# Health check
curl https://your-app.railway.app/api/health
```

## 🔐 Environment Variables

Railway auto-sets:
- `PORT` - Railway assigns (usually 8080)
- `RAILWAY_ENVIRONMENT` - production

Your Dockerfile sets:
- `NODE_ENV=production`

Add custom:
```bash
railway variables set CUSTOM_VAR=value
```

## 📝 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Build failed | `./test-railway-docker.sh` locally |
| App crashed | Check `railway logs` |
| 502 Gateway | Check PORT binding (0.0.0.0) |
| DB lost | Add volume: `railway volumes add` |
| Slow build | Check `.dockerignore` |

## 🎓 Learn More

- Complete guide: `RAILWAY-DOCKER-DEPLOY.md`
- Local testing: `./test-railway-docker.sh`
- Railway CLI: `railway help`

---

**Quick Deploy:**
```bash
railway up
```

**Quick Test:**
```bash
./test-railway-docker.sh
```

**Quick Logs:**
```bash
railway logs
```

That's it! 🚂✅
