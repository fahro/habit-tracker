# 🚂 Railway Setup - Copy/Paste Komande

## ⚡ Brze Komande (Copy-Paste u Terminal)

### 1️⃣ Link Projekat

```bash
cd /Users/fahro/Documents/softprojects/atomic-habits
railway link
```

**Šta uraditi:**
- Strelicama ↑↓ izaberite: **calm-ambition**
- Pritisnite **Enter**

---

### 2️⃣ Provjerite Status

```bash
railway status
```

**Očekivani output:**
```
Project: calm-ambition
Service: atomic-habits
Environment: production
Status: ACTIVE
```

---

### 3️⃣ Otvorite App u Browseru

```bash
railway open
```

**Ili direktno:**
```bash
open https://atomic-habits-production-ecee.up.railway.app
```

---

### 4️⃣ Pogledajte Logove (Real-time)

```bash
railway logs -f
```

*Pritisnite Ctrl+C za izlaz*

---

### 5️⃣ Provjerite Deployment Info

```bash
railway status --json | jq
```

---

### 6️⃣ Test API (iz terminala)

```bash
# Health check
curl https://atomic-habits-production-ecee.up.railway.app/api/health

# Get users
curl https://atomic-habits-production-ecee.up.railway.app/api/users

# Create user
curl -X POST https://atomic-habits-production-ecee.up.railway.app/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "fahro",
    "displayName": "Fahro Test",
    "dailyGoalMinutes": 30
  }'
```

---

## 🔄 Ako Treba Redeploy

```bash
# Redeploy existing code
railway up --detach

# Ili rebuild from scratch
railway up
```

---

## ⚙️ Environment Variables (ako treba)

```bash
# Lista trenutnih
railway variables

# Dodaj novu
railway variables set NODE_ENV=production
```

---

## 📊 Monitoring

```bash
# CPU/Memory metrics
railway status

# Recent deployments
railway logs --deployment
```

---

## 🎯 TL;DR - Samo Ovo Treba

```bash
# 1. Link
railway link
# (izaberite calm-ambition)

# 2. Open
railway open

# 3. Done! ✅
```

---

## ❓ Ako Ništa Ne Radi

**Ručni pristup preko Web-a:**

1. Otvorite: https://railway.app/project/calm-ambition
2. Kliknite na "atomic-habits" service
3. Settings → Public Networking
4. Kliknite na URL: `atomic-habits-production-ecee.up.railway.app`

**To je to!** 🎉
