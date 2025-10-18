# 📚 Study Tracker - Sistem za Praćenje Učenja

Aplikacija za praćenje dnevnog učenja sa automatskom integracijom Viber/WhatsApp poruka, praćenjem napretka, bodovanja i kaznenih bodova.

## ✨ Funkcionalnosti

- **👥 Multi-User Podrška** - Više korisnika sa automatskim prepoznavanjem iz poruka
- **📊 Dashboard** - Pregled svih statistika, grafikon aktivnosti, trenutni niz
- **✅ Praćenje Sesija** - Unos pojedinačnih ili više sesija odjednom
- **🔥 Streak Tracking** - Praćenje trenutnog i najdužeg niza uspješnih dana
- **⚠️ Kazneni Bodovi** - Automatsko evidentiranje penala za 2+ uzastopna dana propusta
- **🎯 Fleksibilni Ciljevi** - Postavite svoj dnevni cilj (minuta)
- **🔗 Webhook Integracija** - Automatsko primanje poruka sa Viber/WhatsApp
- **🐳 Docker Ready** - Kompletna Docker podrška za lakši deployment

## 🚀 Lokalno Pokretanje

### Opcija 1: Docker (Preporučeno) 🐳

**Preduvjeti:**
- Docker i Docker Compose instalirani

**Brzo pokretanje:**

```bash
# Jednostavno pokretanje
docker-compose up -d

# Ili koristi Makefile
make up
```

Aplikacija će biti dostupna na: **http://localhost:3001**

**Docker komande:**

```bash
# Build image
docker-compose build
# ili
make build

# Pokreni u production modu
docker-compose up -d
# ili
make up

# Vidi logove
docker-compose logs -f
# ili
make logs

# Zaustavi kontejnere
docker-compose down
# ili
make down

# Otvori shell u kontejneru
docker-compose exec app sh
# ili
make shell

# Development mod sa hot reload
docker-compose --profile dev up app-dev
# ili
make dev
```

**Prednosti Docker-a:**
- ✅ Nema potrebe za instalacijom Node.js
- ✅ Izbjegavanje problema sa kompilacijom native modula
- ✅ Konzistentno okruženje na svim sistemima
- ✅ Lakši deployment
- ✅ Automatsko čuvanje baze u `./data` folderu

### Opcija 2: Lokalna Instalacija

**Preduvjeti:**
- Node.js 18+ instaliran
- Python 3 i build tools (za better-sqlite3)

**Instalacija:**

```bash
# Instalirajte pakete
npm install

# Pokrenite aplikaciju u development modu
npm run dev
```

Aplikacija će biti dostupna na:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001

## 📱 Format Poruka

Sistem prepoznaje poruke u formatu:

```
Game 1. Steinitz W. - Lipke P. "Play against isolated pawn"
18m 32s
Game 1. Schlechter C. - John W. "2 Important Rules"
22m 11s
Game 1. Paulsen L. - Morphy P. "Paralyzing the Queenside"
18m 3s
```

Podržani formati trajanja:
- `18m 32s` (18 minuta i 32 sekunde)
- `1h 5m` (1 sat i 5 minuta)
- `45m` (45 minuta)
- `30s` (30 sekundi)

## 👥 Multi-User Podrška

Sistem podržava **više korisnika** sa automatskim prepoznavanjem iz poruka!

### Format sa Imenom Korisnika

```
Fahro:
Game 1. Steinitz W. - Lipke P. "Play against isolated pawn"
18m 32s
Game 1. Schlechter C. - John W. "2 Important Rules"
22m 11s
```

```
Marko:
Game 1. Endgame Study
45m
```

**Šta se dešava:**
1. Sistem automatski prepoznaje "Fahro:" i "Marko:" kao korisnička imena
2. Ako korisnik ne postoji, automatski se kreira
3. Sve sesije se pridružuju tom korisniku
4. Svaki korisnik ima svoje statistike, nizove i kaznene bodove

### Frontend User Selector

Dashboard sadrži **dropdown za izbor korisnika** - lako prebacivanje između različitih korisnika i njihovih statistika.

**Više detalja:** Pogledajte [MULTI-USER.md](./MULTI-USER.md) za kompletnu dokumentaciju.

## 🔧 API Endpoints

### Users (Multi-User)

- **GET** `/api/users` - Dohvati sve korisnike
- **GET** `/api/users/:userId` - Dohvati specifičnog korisnika
- **POST** `/api/users` - Kreiraj novog korisnika
  ```json
  {
    "name": "Ana",
    "displayName": "Ana M.",
    "dailyGoalMinutes": 45
  }
  ```
- **PUT** `/api/users/:userId` - Ažuriraj postavke korisnika
- **DELETE** `/api/users/:userId` - Obriši korisnika (cascade delete sesija)

### Sessions

- **POST** `/api/sessions` - Dodaj sesiju(e)
  ```json
  // Single session sa userId
  {
    "userId": 1,
    "lessonName": "Game 1. Steinitz...",
    "duration": 1112
  }
  
  // Multiple sessions sa username
  {
    "username": "Fahro",
    "message": "Game 1...\n18m 32s\nGame 2...\n22m 11s"
  }
  
  // Sa username u samoj poruci
  {
    "message": "Fahro:\nGame 1...\n18m 32s"
  }
  ```

- **GET** `/api/sessions?userId=1&startDate=2024-01-01` - Dohvati sesije za korisnika

### Statistics

- **GET** `/api/stats/overall?userId=1` - Ukupne statistike za korisnika
- **GET** `/api/stats/daily?userId=1&days=30` - Dnevne statistike za korisnika

### Webhook

- **POST** `/api/webhook/message` - Webhook za poruke sa Vibera/WhatsAppa
  ```json
  {
    "message": "Game 1. ...\n18m 32s"
  }
  ```

## 🚂 Production Deployment

### Opcija 1: Docker na bilo kom serveru

**Preduvjeti:**
- Server sa Docker-om (DigitalOcean, AWS, Hetzner, itd.)

```bash
# Na serveru
git clone <your-repo>
cd atomic-habits

# Pokreni sa Docker Compose
docker-compose up -d

# Provjeri status
docker-compose ps
```

### Opcija 2: Railway

**Korak 1: Pripremite Repository**

```bash
git init
git add .
git commit -m "Initial commit"
git push
```

**Korak 2: Deploy na Railway**

1. Idite na [railway.app](https://railway.app)
2. Kliknite **"New Project"**
3. Izaberite **"Deploy from GitHub repo"**
4. Povežite vaš GitHub nalog i repository
5. Railway će automatski detektovati konfiguraciju i deployovati aplikaciju

Railway će automatski koristiti Dockerfile za build.

**Korak 3: Dobijte Webhook URL**

Nakon deploya, Railway će vam dati URL, npr: `https://your-app.railway.app`

Vaš webhook URL će biti: `https://your-app.railway.app/api/webhook/message`

### Opcija 3: Docker Registry (DockerHub, GHCR)

```bash
# Build image
docker build -t your-username/study-tracker:latest .

# Push na DockerHub
docker push your-username/study-tracker:latest

# Pull i pokreni na serveru
docker pull your-username/study-tracker:latest
docker run -d -p 3001:3001 -v $(pwd)/data:/app/data your-username/study-tracker:latest
```

## 📲 Integracija sa Viber/WhatsApp

### Opcija 1: Viber Bot API

1. Kreirajte Viber bot na [partners.viber.com](https://partners.viber.com)
2. Postavite webhook URL na: `https://your-app.railway.app/api/webhook/message`
3. Implementirajte middleware koji parsira Viber format i šalje na webhook

### Opcija 2: WhatsApp Business API

1. Registrujte se za WhatsApp Business API
2. Koristite Twilio ili sličan servis za webhook integraciju
3. Kada primite poruku, prosledite je na: `https://your-app.railway.app/api/webhook/message`

### Opcija 3: Zapier/Make (No-Code)

1. Kreirajte Zapier/Make workflow
2. **Trigger:** Nova poruka u Viber/WhatsApp grupi
3. **Action:** HTTP POST request na webhook URL
   - URL: `https://your-app.railway.app/api/webhook/message`
   - Body: `{ "message": "{{poruka}}" }`

### Opcija 4: Manuelno (Najjednostavnije za početak)

1. Kopirajte poruku iz Viber/WhatsApp grupe
2. Idite na **"Dodaj Sesiju"** tab u aplikaciji
3. Zalijepite u **"Dodaj Više Sesija Odjednom"** polje
4. Kliknite **"Dodaj Sesije"**

## 🎯 Pravila Praćenja

### Statusi Dana

- ✅ **Uspješan dan** - Postignuto ≥ dnevni cilj minuta
- ~ **Djelimičan dan** - Rađeno, ali < dnevni cilj
- ✗ **Propušten dan** - Ništa rađeno

### Kazneni Bodovi

Dobijate kazneni bod kada:
- 2 ili više uzastopnih dana ne postignete dnevni cilj
- Sistem automatski evidentira penal

### Streakovi (Nizovi)

- **Trenutni niz:** Broj uzastopnih dana kada ste postigli cilj
- **Najduži niz:** Rekordni broj uzastopnih uspješnih dana

## 🛠 Tehnologije

- **Frontend:** React, Vite, TailwindCSS, Recharts, Lucide Icons
- **Backend:** Node.js, Express
- **Database:** SQLite (better-sqlite3)
- **Containerization:** Docker, Docker Compose
- **Deployment:** Railway, Docker

## 📊 Primjeri Korištenja

### Dodavanje Sesije preko API-ja (curl)

```bash
curl -X POST https://your-app.railway.app/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Game 1. Test Game\n25m 30s"
  }'
```

### Dohvatanje Statistika

```bash
curl https://your-app.railway.app/api/stats/overall
```

## 🤝 Doprinosi

Slobodno otvorite issue ili pošaljite pull request!

## 📝 Licenca

MIT License

---

Napravljeno sa ❤️ za praćenje učenja šaha i drugih vještina
