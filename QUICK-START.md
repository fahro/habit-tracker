# 🚀 Quick Start - Railway Deployment

## ⏳ Railway Build u Toku

**Trenutni status:** Railway build-uje novu verziju sa popravkama.

**Vrijeme:** 2-3 minuta

## 📋 Što Se Dešava

Railway automatski:
1. ✅ Detektuje GitHub push (commit: e04b504)
2. ⏳ Build-uje Dockerfile (~1-2 min)
3. ⏳ Kompajlira better-sqlite3 za Linux (~30s)
4. ⏳ Build-uje React frontend (~30s)
5. ⏳ Deploy-uje aplikaciju (~30s)

## 🔄 Kako Provjeriti Status

### Opcija 1: Railway Dashboard
```
https://railway.app → Your Project → Deployments
```

Vidite:
- 🟡 "Building" (1-2 min)
- 🟡 "Deploying" (30s)
- 🟢 "Active" ✅

### Opcija 2: API Health Check
```bash
curl https://atomic-habits-production-ecee.up.railway.app/api/health
```

Ako radi:
```json
{"status":"ok","timestamp":"..."}
```

## 🌐 Kada Je Gotovo

### 1. Otvorite App
```
https://atomic-habits-production-ecee.up.railway.app/
```

### 2. Što Trebate Vidjeti

**SA podacima (ako ste već dodali korisnika):**
```
✅ Loading spinner (1-2s)
✅ Dashboard se prikazuje
✅ User selector: "Fahro"
✅ Graf aktivnosti
✅ Statistike
```

**BEZ podataka (prazna baza):**
```
✅ Loading spinner (1-2s)
✅ Poruka: "Nema korisnika. Kreirajte prvog korisnika."
✅ Dugme: "Kreiraj Korisnika"
```

## 🐛 Ako I Dalje Vrti

Ako nakon **5 minuta** i dalje vrti loading:

### 1. Hard Refresh Browser-a
```
Chrome/Edge: Ctrl+Shift+R (Windows) ili Cmd+Shift+R (Mac)
Firefox: Ctrl+F5 (Windows) ili Cmd+Shift+R (Mac)
Safari: Cmd+Option+R (Mac)
```

### 2. Clear Browser Cache
```
Chrome: 
  Settings → Privacy → Clear browsing data
  → Cached images and files
  → Clear data

Firefox:
  Settings → Privacy → Clear Data
  → Cached Web Content
  → Clear
```

### 3. Incognito/Private Mode
```
Chrome: Ctrl+Shift+N
Firefox: Ctrl+Shift+P
Safari: Cmd+Shift+N
```

### 4. Check Console
```
F12 → Console tab
Potražite greške (crveno)
```

## 📊 Dodavanje Podataka

Ako vidite "Nema korisnika":

### Opcija 1: Web UI
1. Tab "Korisnici"
2. Unesite ime: **Fahro**
3. Dnevni cilj: **30** minuta
4. Kliknite "Kreiraj Korisnika"
5. Tab "Dodaj Sesiju"
6. Dodajte par sesija

### Opcija 2: Script (Automatski)
```bash
./init-production-data.sh
```

Kreira:
- ✅ Korisnik: Fahro
- ✅ 10 sesija
- ✅ Mjesečni cilj: 30m

### Opcija 3: Ručno API
```bash
# Kreiraj korisnika
curl -X POST https://atomic-habits-production-ecee.up.railway.app/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Fahro","displayName":"Fahro","dailyGoalMinutes":30}'

# Dodaj sesiju
curl -X POST https://atomic-habits-production-ecee.up.railway.app/api/webhook/message \
  -H "Content-Type: application/json" \
  -d '{"author":"Fahro","content":"Lesson 1 45m"}'
```

## ⚡ Timeline

| Vrijeme | Status | Akcija |
|---------|--------|--------|
| **0:00** | Push na GitHub | ✅ Gotovo |
| **0:30** | Railway detektuje | ⏳ U toku |
| **1:00** | Build počinje | ⏳ U toku |
| **2:00** | Build završava | ⏳ Čeka |
| **2:30** | Deploy počinje | ⏳ Čeka |
| **3:00** | **LIVE!** 🎉 | ✅ Refresh stranicu |

## 🎯 Trenutno Vrijeme

**Pushano:** Prije ~2 minute  
**Očekivano live:** Za ~1 minutu  

**Refresh stranicu svakih 30s:**
```
https://atomic-habits-production-ecee.up.railway.app/
```

## ⚠️ VAŽNO: Volume

**Poslije testa, OBAVEZNO dodajte Volume!**

```
Railway Dashboard → Settings → Volumes → Add Volume
Mount Path: /app/data
Size: 1GB
```

Bez toga, podaci se gube nakon restart-a!

## 📱 Mobile Test

Ako testirate sa telefona:
```
https://atomic-habits-production-ecee.up.railway.app/
```

Radi na:
- ✅ Chrome (Android/iOS)
- ✅ Safari (iOS)
- ✅ Firefox (Android/iOS)

## 🆘 Troubleshooting

### Problem: Loading beskonačno (>10s)
**Rješenje:** 
1. Hard refresh (Ctrl+Shift+R)
2. Clear cache
3. Incognito mode

### Problem: Blank page
**Rješenje:**
1. Check konzolu (F12)
2. Check network tab - da li API radi?
3. Probajte API direktno: `/api/health`

### Problem: "Nema korisnika"
**Rješenje:**
1. To je OK! Dodajte korisnika preko UI
2. Ili pokrenite: `./init-production-data.sh`

---

## ✅ Checklist

- [ ] Pričekajte 3 minute od push-a
- [ ] Refresh stranicu: https://atomic-habits-production-ecee.up.railway.app/
- [ ] Hard refresh ako treba (Cmd+Shift+R)
- [ ] Provjerite da li vidite Dashboard ili "Nema korisnika"
- [ ] Ako vidite "Nema korisnika" - dodajte korisnika
- [ ] Dodajte Volume za perzistenciju podataka

**Za ~1 minutu refresh stranicu!** ⏰
