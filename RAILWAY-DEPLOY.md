# 🚂 Railway Deployment - Quick Guide

## ✅ GitHub Push Completed!

Vaš projekat je **uspješno pushovan** na GitHub:
- 📦 Repository: https://github.com/fahro/atomic-habits
- 🌿 Branch: `main`
- 📝 35 fajlova, 5548 linija koda
- ✅ Commit: "Study Tracker v2.2.0 - Multi-user support with deletion feature"

## 🚀 Railway Deployment Opcije

### Opcija 1: Web Dashboard (Najlakše - Preporučeno)

1. **Otvorite Railway Dashboard**
   ```
   https://railway.app/dashboard
   ```

2. **Kliknite "New Project"**
   - Izaberite "Deploy from GitHub repo"

3. **Autorizujte GitHub**
   - Railway će tražiti pristup vašim GitHub repozitorijima
   - Kliknite "Authorize Railway"

4. **Izaberite Repository**
   - Pronađite i kliknite: `fahro/atomic-habits`

5. **Deploy!**
   - Railway će automatski:
     - ✅ Detektovati Dockerfile
     - ✅ Build-ovati aplikaciju
     - ✅ Deployovati na production URL
     - ✅ Montirati persistent volume za bazu

6. **Dobijete URL**
   ```
   https://atomic-habits-production.up.railway.app
   ```
   (ili sličan)

### Opcija 2: Railway CLI (Terminal)

Railway CLI zahtijeva interaktivni unos, ali evo koraka:

```bash
# 1. Otvorite terminal u projektu
cd /Users/fahro/Documents/softprojects/atomic-habits

# 2. Inicijalizujte Railway projekat
railway init

# Kada vas pita:
# - Project Name: atomic-habits (ili leave blank)
# - Pritisnite Enter

# 3. Deploy
railway up

# 4. Otvorite u browseru
railway open
```

**Alternativno (ako init ne radi):**

```bash
# 1. Povežite postojeći projekat (ako ste kreirali preko web-a)
railway link

# 2. Deploy
railway up

# 3. Pogledajte logove
railway logs
```

### Opcija 3: GitHub Auto-Deploy (Najbolje za production)

**Setup jednom:**

1. **Kreirajte projekat na Railway preko web-a** (Opcija 1)

2. **Povežite GitHub repo**
   - Project Settings → Integrations → GitHub
   - Connect repository: `fahro/atomic-habits`
   - Branch: `main`

3. **Enable Auto-Deploy**
   - Settings → Auto Deploy: ON
   - Trigger deploy on: Push to main

**Sada svaki put kada pushate na GitHub:**
```bash
git add .
git commit -m "Update feature"
git push

# Railway automatski deployuje! 🎉
```

## 🔧 Environment Variables (Opciono)

Ako trebate environment varijable:

**Via Web:**
- Project → Variables
- Add variable: `NODE_ENV=production`

**Via CLI:**
```bash
railway variables set NODE_ENV=production
```

## 📊 Check Deployment Status

**Via Web:**
- Dashboard → Project → Deployments
- Vidite build logs i status

**Via CLI:**
```bash
# Status
railway status

# Logs
railway logs

# Open app
railway open
```

## 🎯 Expected Result

Nakon uspješnog deploya:

```
✅ Build completed
✅ Container running
✅ Database persistent volume mounted
✅ Application accessible at: https://your-app.railway.app
✅ Health check passing
```

**Test:**
```bash
curl https://your-app.railway.app/api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-18T05:17:00.000Z"
}
```

## 🐛 Troubleshooting

### Build Failed?

**Check logs:**
```bash
railway logs --deployment
```

**Common issues:**
- ❌ Missing dependencies → Check package.json
- ❌ Port mismatch → Railway sets PORT automatically
- ❌ Build timeout → Increase build timeout in settings

### App Not Starting?

**Check:**
1. Dockerfile syntax
2. Start command: `node server/index.js`
3. Port binding: `process.env.PORT || 3001`

**View logs:**
```bash
railway logs
```

## 📱 Post-Deployment

### 1. Test Application
```bash
# Open app
railway open

# Or visit directly
open https://your-app.railway.app
```

### 2. Test API
```bash
# Create test user
curl -X POST https://your-app.railway.app/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "testuser",
    "displayName": "Test User",
    "dailyGoalMinutes": 30
  }'

# Get users
curl https://your-app.railway.app/api/users
```

### 3. Setup Custom Domain (Opciono)

**Via Web:**
- Settings → Domains → Add Domain
- Enter: `study-tracker.yourdomain.com`
- Add DNS CNAME record as instructed

### 4. Monitor

**Via Web:**
- Metrics → CPU, Memory, Network usage
- Logs → Real-time application logs

**Via CLI:**
```bash
# Real-time logs
railway logs -f

# Metrics
railway status
```

## 🎉 Success!

Vaša aplikacija je sada:
- ✅ Na GitHubu: https://github.com/fahro/atomic-habits
- ✅ Deployovana na Railway
- ✅ Pristupačna preko HTTPS
- ✅ Sa persistent bazom podataka
- ✅ Auto-deploy na svaki push (ako ste podesili)

## 📚 Dodatne Komande

```bash
# Restart app
railway restart

# View environment
railway variables

# Run command u container-u
railway run bash

# Delete deployment
railway down

# View all projects
railway list
```

## 💡 Pro Tips

1. **Logs** - Uvijek prvo provjerite logove ako nešto ne radi
2. **Env Variables** - Nikad ne commitujte secrets
3. **Custom Domain** - Koristite za production
4. **Auto Deploy** - Setup nakon testiranja
5. **Monitoring** - Redovno provjeravajte metrics

## 🔗 Korisni Linkovi

- Railway Dashboard: https://railway.app/dashboard
- Railway Docs: https://docs.railway.com
- Railway CLI Docs: https://docs.railway.com/guides/cli
- GitHub Repo: https://github.com/fahro/atomic-habits

---

**Happy Deploying! 🚀**

Ako imate pitanja ili probleme, provjerite Railway docs ili railway logs! 
