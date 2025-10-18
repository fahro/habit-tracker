# ⚡ Quick Start Guide

## 🚀 Najbrži način da počnete (Docker)

```bash
# 1. Pokrenite skriptu (automatski build i start)
./start.sh

# 2. Otvorite browser
# http://localhost:3001
```

That's it! 🎉

## 📋 Šta ste dobili?

### 1. **Dashboard** (http://localhost:3001)
- Pregled svih statistika
- Grafikon aktivnosti (zadnjih 14 dana)
- Trenutni niz uspješnih dana
- Kazneni bodovi za propuste
- Detaljan pregled svih dana

### 2. **Dodaj Sesiju**
Tri načina:

**Način 1: Ručni unos**
- Unesite naziv lekcije
- Unesite trajanje (sati, minute, sekunde)
- Kliknite "Dodaj Sesiju"

**Način 2: Copy-Paste sa Vibera/WhatsAppa**
```
Game 1. Steinitz W. - Lipke P. "Play against isolated pawn"
18m 32s
Game 1. Schlechter C. - John W. "2 Important Rules"
22m 11s
```
- Kopirajte poruku
- Zalijepite u "Dodaj Više Sesija Odjednom"
- Kliknite "Dodaj Sesije"

**Način 3: Sa Imenom Korisnika (Multi-User)**
```
Fahro:
Game 1. Chess Tactics
30m
Game 2. Opening Theory
25m
```
- Unesite ime u polje "Ime Korisnika" ILI dodajte u poruku (sa ":")
- Korisnik će biti automatski kreiran ako ne postoji
- Zalijepite poruku i kliknite "Dodaj Sesije"

### 3. **Korisnici**
- Kreirajte nove korisnike sa prilagođenim imenima
- Postavite individualne dnevne ciljeve za svakog korisnika
- Pregledajte listu svih korisnika
- Uredite postavke postojećih korisnika

### 4. **Postavke**
- Promijenite dnevni cilj za trenutnog korisnika (default: 30 minuta)
- Sistem automatski prati da li ste postigli cilj

## 🎯 Kako sistem funkcioniše?

### Statusi Dana
- ✅ **Zeleno** = Postignut dnevni cilj
- 🟠 **Narančasto** = Radili ste, ali ispod cilja
- ⚫ **Sivo** = Ništa nije rađeno

### Kazneni Bodovi ⚠️
Automatski dobijate kazneni bod kada:
- **2 ili više dana uzastopno** ne postignete cilj
- Prikazuje se crveni "Penal" badge

### Nizovi (Streaks) 🔥
- **Trenutni niz**: Koliko uzastopnih dana postižete cilj (danas i unazad)
- **Najduži niz**: Vaš rekord

## 🔗 Webhook za Viber/WhatsApp

Vaš webhook URL je:
```
http://localhost:3001/api/webhook/message
```

Za production (nakon deploya):
```
https://your-app.railway.app/api/webhook/message
```

**Test webhook-a:**

Bez korisničkog imena (koristi prvog korisnika):
```bash
curl -X POST http://localhost:3001/api/webhook/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Game 1. Test Game\n25m 30s\nGame 2. Another Test\n15m"
  }'
```

Sa korisničkim imenom:
```bash
curl -X POST http://localhost:3001/api/webhook/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Fahro:\nGame 1. Chess Tactics\n30m\nGame 2. Openings\n20m"
  }'
```

## 👥 Multi-User Testiranje

**Kreiranje više korisnika:**
```bash
# Fahro dodaje sesije
curl -X POST http://localhost:3001/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Fahro",
    "message": "Game 1. Queen'\''s Gambit\n45m"
  }'

# Marko dodaje sesije
curl -X POST http://localhost:3001/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Marko",
    "message": "Game 1. Sicilian Defense\n30m"
  }'

# Provjera korisnika
curl http://localhost:3001/api/users | jq

# Statistike za Fahra
curl "http://localhost:3001/api/stats/overall?userId=1" | jq

# Statistike za Marka
curl "http://localhost:3001/api/stats/overall?userId=2" | jq
```

## 🐳 Docker Komande

```bash
# Zaustavi aplikaciju
docker-compose down

# Pokreni ponovo
docker-compose up -d

# Vidi logove
docker-compose logs -f

# Restart
docker-compose restart

# Vidi status
docker-compose ps

# Otvori shell u kontejneru
docker-compose exec app sh
```

## 📊 Gdje se čuvaju podaci?

Svi podaci se čuvaju u:
```
./data/study-tracker.db
```

**Backup baze:**
```bash
cp ./data/study-tracker.db ./backup-$(date +%Y%m%d).db
```

**Restore baze:**
```bash
docker-compose down
cp ./backup-20241017.db ./data/study-tracker.db
docker-compose up -d
```

## 🚂 Deploy na Production

### Railway (Najlakše)

1. **Push na GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Deploy na Railway**
- Idite na [railway.app](https://railway.app)
- Kliknite "New Project" → "Deploy from GitHub repo"
- Izaberite repository
- Railway će automatski detektovati Dockerfile i deployovati

3. **Dobijte URL**
Railway će vam dati URL, npr: `https://study-tracker-production.up.railway.app`

### Docker na bilo kom serveru

```bash
# Na serveru (DigitalOcean, AWS, itd.)
git clone <your-repo>
cd atomic-habits
docker-compose up -d
```

## 🔧 Troubleshooting

### Port 3001 već u upotrebi?

Promijenite u `docker-compose.yml`:
```yaml
ports:
  - "8080:3001"  # Koristite 8080 umjesto 3001
```

### Kontejner se restartuje?

```bash
# Provjerite logove
docker-compose logs

# Rebuild bez cache-a
docker-compose build --no-cache
```

### Baza se ne čuva?

```bash
# Provjerite da li folder postoji
ls -la ./data

# Provjerite permissions
chmod 777 ./data
```

## 📱 Integracija sa Viber/WhatsApp

### Opcija 1: Zapier (No-Code) ⭐ Najlakše

1. Registrujte se na [Zapier](https://zapier.com)
2. Kreirajte Zap:
   - **Trigger**: Viber/WhatsApp - New Message
   - **Action**: Webhooks - POST request
   - URL: `https://your-app.railway.app/api/webhook/message`
   - Body: `{"message": "{{message_text}}"}`

### Opcija 2: Viber Bot API

1. Kreirajte bot na [partners.viber.com](https://partners.viber.com)
2. Implementirajte webhook handler
3. Prosledite poruke na vaš webhook

### Opcija 3: WhatsApp Business API

Koristite Twilio ili sličan servis za integraciju.

### Opcija 4: Manuelno (Za početak)

Jednostavno kopirajte poruke i zalijepite u aplikaciju! ✨

## 💡 Tips & Tricks

1. **Postavite realan cilj** - Bolje 30min dnevno nego 2h koje nećete postići
2. **Konzistentnos > Intenzitet** - Niz dana je važniji od pojedinačnih sesija
3. **Review statistika** - Provjerite grafikon svake nedjelje
4. **Backup** - Čuvajte backup baze jednom mjesečno

## 🆘 Pomoć

Za više informacija:
- **README.md** - Detaljne instrukcije
- **DOCKER.md** - Docker vodič
- **API dokumentacija** - U README.md

---

**Sretno sa učenjem! 📚🎯**
