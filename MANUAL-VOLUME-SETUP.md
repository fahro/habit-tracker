# 📦 Railway Volume Setup - Manuelno

## ⚠️ KRITIČNO: Database Persistence

Railway ima **ephemeral filesystem** - bez volume-a, svi podaci se gube nakon redeploya!

---

## 🔧 Dodavanje Volume-a (Ručno)

### Opcija 1: Railway Dashboard (Preporučeno)

1. **Otvorite Railway Dashboard**
   ```
   https://railway.app
   ```

2. **Izaberite Projekt**
   - Kliknite na: `atomic-habits`

3. **Otvorite Settings**
   - Kliknite na projekt
   - Izaberite tab: **Settings**

4. **Dodajte Volume**
   - Scroll do sekcije: **Volumes**
   - Kliknite: **+ Add Volume**

5. **Konfigurišite Volume**
   ```
   Name: data
   Mount Path: /app/data
   Size: 1 GB
   ```

6. **Sačuvajte**
   - Kliknite: **Add Volume**
   - Railway će restartovati aplikaciju

### Opcija 2: Railway CLI

```bash
# Install CLI (ako nije instalirano)
brew install railway

# Login
railway login

# Link to project
railway link

# Add volume
railway volume add data --mount-path /app/data

# Restart
railway restart
```

### Opcija 3: Automatski Script

```bash
./add-railway-volume.sh
```

---

## ✅ Verifikacija

### 1. Provjeri Da Li Volume Postoji

**Dashboard:**
```
Settings → Volumes → Trebao bi vidjeti "data"
```

**CLI:**
```bash
railway volumes list
```

### 2. Provjeri Mount Path

Volume mora biti mount-ovan na:
```
/app/data
```

Database file će biti:
```
/app/data/study-tracker.db
```

---

## 📊 Što Volume Radi

### Prije Volume-a ❌
```
Deploy 1: Kreirate podatke → Database postoji
Redeploy: Novi build → Database OBRISAN! ❌
```

### Sa Volume-om ✅
```
Deploy 1: Kreirate podatke → Database postoji
Redeploy: Novi build → Database PERZISTIRA! ✅
```

---

## 🔄 Nakon Dodavanja Volume-a

### 1. Aplikacija će se restartovati
```
Railway automatski restartuje aplikaciju kada dodate volume.
Pričekajte ~1-2 minute.
```

### 2. Database će biti prazan (prvi put)
```
Novi volume je prazan.
Trebate ponovo kreirati podatke.
```

### 3. Popunite Bazu
```bash
./seed-railway-users.sh
```

---

## 📝 Šta Se Dešava Sa Podacima

### Scenario 1: Prvi Deployment Sa Volume-om
```
1. Volume je prazan
2. Aplikacija startuje
3. Kreira novu praznu bazu u /app/data/study-tracker.db
4. Popunite sa seed script-om
```

### Scenario 2: Redeploy (Sa Volume-om)
```
1. Volume postoji sa podacima
2. Nova verzija aplikacije startuje
3. Povezuje se na postojeću bazu u /app/data/study-tracker.db
4. SVI PODACI PERZISTIRAJU! ✅
```

### Scenario 3: Redeploy (BEZ Volume-a) ❌
```
1. Nema volume-a
2. Nova verzija aplikacije startuje
3. Kreira novu praznu bazu u /app/study-tracker.db (ephemeral)
4. SVI STARI PODACI OBRISANI! ❌
```

---

## ⚙️ Tehničke Detalji

### Database Lokacija

**Bez Volume-a (ephemeral):**
```javascript
const dbPath = '/app/data/study-tracker.db'  // ❌ Gubi se na redeploy
```

**Sa Volume-om (persistent):**
```javascript
const dbPath = '/app/data/study-tracker.db'  // ✅ Volume perzistira
```

### Volume Karakteristike

| Karakteristika | Vrijednost |
|----------------|------------|
| Mount Path | `/app/data` |
| Size | 1 GB (besplatno do 1GB) |
| Backup | Automatski (Railway) |
| Perzistencija | Across redeploys |
| Performance | Fast (local disk) |

---

## 🧪 Testiranje Volume-a

### 1. Kreirajte Test Podatke
```bash
curl -X POST https://atomic-habits-production-ecee.up.railway.app/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"TestUser","displayName":"Test User","dailyGoalMinutes":30}'
```

### 2. Provjeri Podatke
```bash
curl https://atomic-habits-production-ecee.up.railway.app/api/users
# Trebao bi vidjeti TestUser
```

### 3. Trigger Redeploy
```bash
# Push prazan commit
git commit --allow-empty -m "Test redeploy"
git push

# Ili via CLI
railway restart
```

### 4. Pričekaj Deployment (~2 min)

### 5. Provjeri Podatke Ponovo
```bash
curl https://atomic-habits-production-ecee.up.railway.app/api/users
# ✅ TestUser bi trebao JOŠ biti tu!
```

---

## 🚨 Troubleshooting

### Problem: Volume nije dodat
```
Error: Volume not found
```

**Rješenje:**
1. Provjeri Railway Dashboard
2. Settings → Volumes
3. Ako nema "data" volume-a, dodaj ga

### Problem: Mount path pogrešan
```
Database se i dalje gubi
```

**Rješenje:**
1. Provjeri mount path: `/app/data`
2. Ne `/data` ili `/app` samo!
3. Mora biti tačno `/app/data`

### Problem: Podaci se i dalje gube
```
Volumen postoji ali podaci se gube
```

**Rješenje:**
1. Provjeri da li je aplikacija deployovana NAKON dodavanja volume-a
2. Restart aplikacije: `railway restart`
3. Provjeri logs: `railway logs`

---

## 💰 Pricing

Railway Free Tier:
- ✅ **1 GB Volume** - Besplatno
- ✅ **Perzistentni storage** - Besplatno
- ✅ **Automatski backup** - Uključeno

Više od 1GB:
- $0.25/GB/mjesec (vrlo jeftino)

---

## 📚 Links

- **Railway Volumes Docs:** https://docs.railway.app/guides/volumes
- **Railway Dashboard:** https://railway.app
- **Project URL:** https://atomic-habits-production-ecee.up.railway.app

---

## ✅ Checklist

- [ ] Railway Dashboard otvoren
- [ ] Projekt izabran (atomic-habits)
- [ ] Settings tab otvoren
- [ ] Volume dodat (data, /app/data, 1GB)
- [ ] Aplikacija restartovana
- [ ] Podaci kreirani (`./seed-railway-users.sh`)
- [ ] Test redeploy uradjen
- [ ] Podaci perzistiraju ✅

---

**Dodajte Volume SADA da ne izgubite podatke!** 📦✅
