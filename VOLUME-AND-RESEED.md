# 🔄 Volume Setup i Re-Seed Sa Podacima Jul-Oktobar

## 🎯 Cilj

1. ✅ Dodati Railway Volume da database ne bude obrisan
2. ✅ Popuniti bazu sa podacima od **jula do oktobra** (4 mjeseca)

---

## 📦 Korak 1: Dodaj Railway Volume

### Opcija A: Railway Dashboard (Najlakše)

1. Otvorite: https://railway.app
2. Izaberite projekt: `atomic-habits`
3. Kliknite na projekt → **Settings**
4. Scroll do **Volumes**
5. Kliknite **+ Add Volume**
6. Postavite:
   ```
   Name: data
   Mount Path: /app/data
   Size: 1 GB
   ```
7. Kliknite **Add Volume**
8. Railway će automatski restartovati aplikaciju (1-2 min)

### Opcija B: Railway CLI

```bash
# Login ako niste
railway login

# Link to project
railway link

# Add volume
railway volume add data --mount-path /app/data

# Restart
railway restart
```

### Opcija C: Automatski Script

```bash
./add-railway-volume.sh
```

---

## 🔄 Korak 2: Pričekaj Restart

Nakon dodavanja volume-a:
1. Railway automatski restartuje aplikaciju
2. Pričekajte **2-3 minute**
3. Provjeri da li radi:

```bash
curl https://atomic-habits-production-ecee.up.railway.app/api/health
```

Očekivano:
```json
{
  "status": "ok",
  "timestamp": "2025-10-18T..."
}
```

---

## 🌱 Korak 3: Popuni Bazu (Jul-Oktobar)

### Automatski (Preporučeno)

```bash
./seed-railway-users.sh
```

Ovo će kreirati:
- ✅ 3 korisnika (Dobri Haso, Pošteni Mujo, Lijeni Suljo)
- ✅ Mjesečne ciljeve (Jul, Aug, Sep, Okt)
- ✅ Podatke za **4 mjeseca** (Jul 1 - Okt 18)
- ✅ Kreiranje korisnika datum: **2025-07-01**

### Ručno

```bash
# 1. Kreiraj korisnike
curl -X POST https://atomic-habits-production-ecee.up.railway.app/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Haso","displayName":"Dobri Haso","dailyGoalMinutes":30}'

curl -X POST https://atomic-habits-production-ecee.up.railway.app/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Mujo","displayName":"Pošteni Mujo","dailyGoalMinutes":30}'

curl -X POST https://atomic-habits-production-ecee.up.railway.app/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Suljo","displayName":"Lijeni Suljo","dailyGoalMinutes":30}'

# 2. Postavi mjesečne ciljeve
for month in 6 7 8 9; do
  curl -X POST https://atomic-habits-production-ecee.up.railway.app/api/settings/monthly \
    -H "Content-Type: application/json" \
    -d "{\"year\":2025,\"month\":$month,\"dailyGoalMinutes\":30}"
done

# 3. Kreiraj sesije (koristi seed script jer je puno sesija)
# Ili ručno dodaj sesije sa datumima od jula do oktobra
```

---

## ✅ Korak 4: Verifikacija

### 1. Provjeri Korisnike

```bash
curl https://atomic-habits-production-ecee.up.railway.app/api/users | jq
```

Očekivano:
```json
[
  {
    "id": 1,
    "name": "Haso",
    "display_name": "Dobri Haso",
    "created_at": "2025-07-01 00:00:00"
  },
  {
    "id": 2,
    "name": "Mujo",
    "display_name": "Pošteni Mujo",
    "created_at": "2025-07-01 00:00:00"
  },
  {
    "id": 3,
    "name": "Suljo",
    "display_name": "Lijeni Suljo",
    "created_at": "2025-07-01 00:00:00"
  }
]
```

### 2. Provjeri Statistike

```bash
# Dobri Haso
curl "https://atomic-habits-production-ecee.up.railway.app/api/stats/overall?userId=1" | jq

# Očekivano: ~90+ sesija, ~80h vremena
```

### 3. Provjeri Penale

```bash
# Jul penali - Lijeni Suljo
curl "https://atomic-habits-production-ecee.up.railway.app/api/stats/daily?userId=3&year=2025&month=6" | jq '.totalPenalties'

# Očekivano: Lijeni Suljo ima penale (2+)
```

### 4. Otvori Web App

```
https://atomic-habits-production-ecee.up.railway.app/
```

Trebali biste vidjeti:
- ✅ 3 korisnika u dropdown-u
- ✅ Podatke od jula do oktobra
- ✅ Crvene penale za Lijenog Sulju

---

## 📊 Očekivani Podaci

### Juli 2025 (31 dan)
- Dobri Haso: ~28 dana aktivnih
- Pošteni Mujo: ~23 dana aktivnih
- Lijeni Suljo: ~15 dana aktivnih, 1-2 penala

### August 2025 (31 dan)
- Dobri Haso: ~28 dana aktivnih
- Pošteni Mujo: ~23 dana aktivnih
- Lijeni Suljo: ~15 dana aktivnih, 1-2 penala

### Septembar 2025 (30 dana)
- Dobri Haso: ~27 dana aktivnih
- Pošteni Mujo: ~22 dana aktivnih
- Lijeni Suljo: ~12 dana aktivnih, 1-2 penala

### Oktobar 2025 (18 dana do danas)
- Dobri Haso: ~16 dana aktivnih
- Pošteni Mujo: ~13 dana aktivnih
- Lijeni Suljo: ~5 dana aktivnih, 1-2 penala

### Ukupno (110 dana)
- **Dobri Haso:** ~100 sesija, ~80h
- **Pošteni Mujo:** ~80 sesija, ~55h
- **Lijeni Suljo:** ~35 sesija, ~20h, **6-8 penala ukupno**

---

## 🔄 Test Perzistencije

Nakon što popunite bazu, testirajte da li volume radi:

### 1. Kreiraj Test Podatke

```bash
curl -X POST https://atomic-habits-production-ecee.up.railway.app/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"TestUser","displayName":"Test User","dailyGoalMinutes":30}'
```

### 2. Trigger Redeploy

```bash
# Prazan commit
git commit --allow-empty -m "Test volume persistence"
git push
```

### 3. Pričekaj 2-3 Minute

### 4. Provjeri Podatke

```bash
curl https://atomic-habits-production-ecee.up.railway.app/api/users | jq
```

**Ako volume radi:**
- ✅ Svi korisnici (Haso, Mujo, Suljo, TestUser) su tu
- ✅ Database nije obrisan

**Ako volume NE radi:**
- ❌ Nema korisnika ili samo novi
- ❌ Database obrisan

---

## 🚨 Troubleshooting

### Problem: Deployment fails

```
Error: Application not found
```

**Rješenje:**
1. Pričekajte 3-5 minuta
2. Railway možda još build-uje
3. Provjeri logs: `railway logs`

### Problem: Database se i dalje briše

```
Nakon redeploya nema podataka
```

**Rješenje:**
1. Provjeri da li volume POSTOJI:
   - Railway Dashboard → Settings → Volumes
   - Mora vidjeti "data" volume

2. Provjeri mount path:
   - Mora biti `/app/data`
   - Ne `/data` ili `/app`

3. Restart aplikacije:
   ```bash
   railway restart
   ```

### Problem: Seed script ne radi

```
Error: User not found
```

**Rješenje:**
1. Provjeri da li server radi:
   ```bash
   curl https://atomic-habits-production-ecee.up.railway.app/api/health
   ```

2. Ako ne radi, pričekaj deployment

3. Probaj ponovo:
   ```bash
   ./seed-railway-users.sh
   ```

---

## 📝 Checklist

- [ ] Railway Volume dodat (`/app/data`)
- [ ] Aplikacija restartovana
- [ ] Server radi (`/api/health` returns OK)
- [ ] Seed script pokrenut (`./seed-railway-users.sh`)
- [ ] 3 korisnika kreirano
- [ ] Mjesečni ciljevi postavljeni (Jul-Okt)
- [ ] Podaci generisani (Jul 1 - Okt 18)
- [ ] Web app prikazuje podatke
- [ ] Test redeploy urađen
- [ ] Podaci perzistiraju nakon redeploy-a ✅

---

## 🎯 Finalni Rezultat

Nakon svih koraka:

✅ **Volume aktivan** - Database perzistira  
✅ **3 korisnika** - Haso, Mujo, Suljo  
✅ **4 mjeseca podataka** - Jul, Aug, Sep, Okt  
✅ **~100+ sesija** - Realistični podaci  
✅ **Penali prikazani** - Lijeni Suljo ima 6-8 penala  
✅ **Perzistencija** - Redeploy ne briše podatke  

---

## 🌐 URLs

- **Dashboard:** https://railway.app
- **App URL:** https://atomic-habits-production-ecee.up.railway.app/
- **Health Check:** https://atomic-habits-production-ecee.up.railway.app/api/health

---

**Sad imate potpuno funkcionalan deployment sa perzistentnim podacima! 🎉**
