# 🚀 Railway Production Data - Uspješno Kreirano!

## ✅ Status: LIVE & READY

**URL:** https://atomic-habits-production-ecee.up.railway.app/

---

## 👥 Korisnici (3)

| ID | Ime | Kreirano | Opis |
|----|-----|----------|------|
| 1 | 🏆 **Dobri Haso** | 2025-08-01 | Odličan učenik, radi skoro svaki dan |
| 2 | 💪 **Pošteni Mujo** | 2025-08-01 | Dobar učenik, solidno radi |
| 3 | 😴 **Lijeni Suljo** | 2025-08-01 | Lijen, propušta često, ima penale |

---

## 📊 Statistike (Za 3 Mjeseca)

### 🏆 Dobri Haso
- **Sesije:** 72
- **Vrijeme:** 60h 7m
- **Trenutni streak:** 30 dana
- **Penali:**
  - August: 0
  - Septembar: 0
  - Oktobar: 0
- **Status:** 🟢 Odličan učenik

### 💪 Pošteni Mujo
- **Sesije:** 58
- **Vrijeme:** 40h 27m
- **Trenutni streak:** 4 dana
- **Penali:**
  - August: 0
  - Septembar: 0
  - Oktobar: 0
- **Status:** 🟢 Dobar učenik

### 😴 Lijeni Suljo
- **Sesije:** 26
- **Vrijeme:** 15h 29m
- **Trenutni streak:** 0 dana
- **Penali:**
  - August: 25 penala ⚠️
  - Septembar: 25 penala ⚠️
  - Oktobar: 25 penala ⚠️
- **Status:** 🔴 Lijen, mnogo propušta

---

## 🎯 Mjesečni Ciljevi

| Mjesec | Dnevni cilj |
|--------|-------------|
| August 2025 | 30 minuta |
| Septembar 2025 | 30 minuta |
| Oktobar 2025 | 30 minuta |

---

## 📅 Podaci Generisani Za

- **August 2025:** 1-31 avgust (31 dan)
- **Septembar 2025:** 1-30 septembar (30 dana)
- **Oktobar 2025:** 1-18 oktobar (18 dana, do danas)

**Ukupno:** 79 dana aktivnosti

---

## 🔍 Karakteristike Korisnika

### 🏆 Dobri Haso
- Radi **~90% dana**
- Sesije: 35-65 minuta
- Redovan i disciplinovan
- **0 penala** - nikad ne propušta 2 uzastopna dana

### 💪 Pošteni Mujo
- Radi **~75% dana**
- Sesije: 30-55 minuta
- Solidno se drži cilja
- **0 penala** - ređe propušta ali se vrati

### 😴 Lijeni Suljo
- Radi **~40% dana** ili manje
- Sesije: 20-45 minuta (kad radi)
- Često propušta učenje
- **25 penala po mjesecu** - često 2+ uzastopna dana propusta

---

## 🧪 Testiranje

### API Endpoints

```bash
# Zdravlje servera
curl https://atomic-habits-production-ecee.up.railway.app/api/health

# Korisnici
curl https://atomic-habits-production-ecee.up.railway.app/api/users

# Statistike - Dobri Haso
curl "https://atomic-habits-production-ecee.up.railway.app/api/stats/overall?userId=1"

# Penali za Oktobar - Lijeni Suljo
curl "https://atomic-habits-production-ecee.up.railway.app/api/stats/daily?userId=3&year=2025&month=9"

# Mjesečni cilj
curl "https://atomic-habits-production-ecee.up.railway.app/api/settings/monthly/2025/9"
```

### Web UI

Otvorite: https://atomic-habits-production-ecee.up.railway.app/

**Trebali biste vidjeti:**
1. User selector sa 3 korisnika
2. Dashboard sa statistikama
3. Graf aktivnosti za 3 mjeseca
4. Mjesečni pregled sa penalima (crveni za Suljo)

---

## 🎨 Vizualizacija

### Graf Aktivnosti
- **Dobri Haso:** Pun graf, skoro svaki dan zeleno
- **Pošteni Mujo:** Većina dana zeleno, par praznina
- **Lijeni Suljo:** Puno praznina, mnogo crvenih penala

### Mjesečni Pregled
- **Penali prikazani crveno** za Lijenog Sulju
- Horizontalna linija cilja na 30 minuta
- Status za svaki dan (✓, ✗, ili ⚠️)

---

## 🔄 Kako Sam Generisao Podatke

### 1. Kreirao Korisnike
```bash
curl -X POST .../api/users \
  -d '{"name":"Haso","displayName":"Dobri Haso","dailyGoalMinutes":30}'
```

### 2. Postavio Mjesečne Ciljeve
```bash
curl -X POST .../api/settings/monthly \
  -d '{"year":2025,"month":7,"dailyGoalMinutes":30}'
```

### 3. Generisao Sesije Sa Datumima
```bash
curl -X POST .../api/sessions \
  -d '{
    "userId": 1,
    "lessonName": "Lesson 1",
    "duration": 2700,
    "date": "2025-08-01"
  }'
```

### 4. Ažurirao Created_at Datume
```bash
curl -X PATCH .../api/users/1/created-at \
  -d '{"createdAt":"2025-08-01 00:00:00"}'
```

---

## 📂 Files

| File | Opis |
|------|------|
| `seed-railway-users.sh` | Script za automatsku generaciju podataka |
| `RAILWAY-PRODUCTION-DATA.md` | Ova dokumentacija |

---

## ⚠️ VAŽNO: Database Persistence

**Railway ima ephemeral filesystem!**

### Dodaj Volume Za Perzistenciju:

```
Railway Dashboard → Settings → Volumes → Add Volume
Mount Path: /app/data
Size: 1GB
```

**Bez volume-a, svi podaci će se izgubiti nakon restart-a!**

---

## 🔥 Quick Commands

### Regenerisanje Podataka
```bash
./seed-railway-users.sh
```

### Provjera Penala
```bash
for month in 7 8 9; do
  echo "Month $month:"
  curl -s ".../api/stats/daily?userId=3&year=2025&month=$month" | jq '.totalPenalties'
done
```

### Provjera Statistika
```bash
for user_id in 1 2 3; do
  curl -s ".../api/stats/overall?userId=$user_id" | jq
done
```

---

## 🎉 Rezultat

### Web App Prikazuje:

✅ **3 korisnika** sa realističnim podacima  
✅ **79 dana** aktivnosti (Aug-Okt)  
✅ **Penali rade** za Lijenog Sulju  
✅ **Grafovi prikazuju** razlike između korisnika  
✅ **Mjesečni pregled** sa statusima i penalima  
✅ **Streaks** se pravilno računaju  
✅ **Statistike** prikazuju ukupno vrijeme i sesije  

---

## 📱 Test Na Različitim Korisnicima

### Izaberi "Dobri Haso"
- Vidite pun graf
- Visok streak (30 dana)
- Mnogo zelenih dana
- 0 penala

### Izaberi "Pošteni Mujo"
- Dobar graf
- Srednji streak
- Većina dana zeleno
- 0 penala

### Izaberi "Lijeni Suljo"
- Prazan graf
- Nizak streak (0 dana)
- Mnogo praznina
- **25 penala po mjesecu!** 🔴

---

## 🚀 Deployment Info

| Info | Vrijednost |
|------|-----------|
| Platform | Railway |
| Region | europe-west4 |
| URL | atomic-habits-production-ecee.up.railway.app |
| Database | SQLite (ephemeral bez volume-a) |
| Docker | Multi-stage optimized |
| Health Check | /api/health |

---

## 📝 Git Commits

```
c4a6d12 - Add date parameter support for backdating sessions
8c09ed2 - Add endpoint to update user created_at date
...
```

---

**🎉 Railway Production je potpuno funkcionalan sa realističnim podacima!**

**Open:** https://atomic-habits-production-ecee.up.railway.app/

**Uživajte! 🚂✅**
