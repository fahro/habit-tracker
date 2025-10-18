# 👥 Multi-User Podrška

Study Tracker sada podržava **više korisnika** sa automatskim prepoznavanjem i kreiranjem korisnika na osnovu poruka!

## ✨ Funkcionalnosti

- **Automatsko kreiranje korisnika** - Novi korisnici se kreiraju automatski pri prvom unosu
- **Manuelno kreiranje korisnika** - UI za eksplicitno kreiranje novih korisnika
- **Prepoznavanje iz poruka** - Sistem prepoznaje korisničko ime iz Viber/WhatsApp poruka
- **Odvojene statistike** - Svaki korisnik ima svoje statistike, nizove i kaznene bodove
- **User selector** - Lako prebacivanje između korisnika u frontendu
- **User management** - Pregled, kreiranje i uređivanje korisnika

## 📱 Formati Poruka

### Format 1: Ime na početku poruke (sa ":")

```
Fahro:
Game 1. Steinitz W. - Lipke P. "Play against isolated pawn"
18m 32s
Game 1. Schlechter C. - John W. "2 Important Rules"
22m 11s
```

### Format 2: Eksplicitni username parametar (API)

```bash
curl -X POST http://localhost:3001/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Marko",
    "message": "Game 1. Test\n25m 30s"
  }'
```

### Format 3: Bez imena (koristi trenutnog korisnika)

```
Game 1. Test Lesson
25m 30s
Game 2. Another Lesson
15m
```

## 🔧 API Endpointi

### Korisnici

**GET `/api/users`** - Dohvati sve korisnike
```bash
curl http://localhost:3001/api/users
```

Response:
```json
[
  {
    "id": 1,
    "name": "Fahro",
    "display_name": "Fahro",
    "daily_goal_minutes": 30,
    "created_at": "2025-10-17 20:06:52"
  },
  {
    "id": 2,
    "name": "Marko",
    "display_name": "Marko",
    "daily_goal_minutes": 30,
    "created_at": "2025-10-17 20:07:03"
  }
]
```

**GET `/api/users/:userId`** - Dohvati specifičnog korisnika
```bash
curl http://localhost:3001/api/users/1
```

**POST `/api/users`** - Kreiraj novog korisnika
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ana",
    "displayName": "Ana M.",
    "dailyGoalMinutes": 45
  }'
```

**PUT `/api/users/:userId`** - Ažuriraj postavke korisnika
```bash
curl -X PUT http://localhost:3001/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"dailyGoalMinutes": 60}'
```

**DELETE `/api/users/:userId`** - Obriši korisnika
```bash
curl -X DELETE http://localhost:3001/api/users/1
```

Response (Success):
```json
{
  "success": true,
  "message": "Korisnik uspješno obrisan"
}
```

Response (Error - Last User):
```json
{
  "error": "Ne možete obrisati jedinog korisnika"
}
```

**NAPOMENA:** Brisanje korisnika će automatski obrisati sve njegove sesije (cascade delete).

### Sesije (sa user kontekstom)

**POST `/api/sessions`** - Dodaj sesiju sa automatskim user-om
```bash
# Sa username-om u poruci
curl -X POST http://localhost:3001/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Fahro:\nGame 1. Test\n25m"
  }'

# Sa eksplicitnim username parametrom
curl -X POST http://localhost:3001/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Marko",
    "message": "Game 1. Test\n25m"
  }'

# Sa userId parametrom
curl -X POST http://localhost:3001/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "lessonName": "Game 1. Test",
    "duration": 1500
  }'
```

**GET `/api/sessions?userId=1`** - Dohvati sesije za korisnika
```bash
curl "http://localhost:3001/api/sessions?userId=1"
```

### Statistike (po korisniku)

**GET `/api/stats/overall?userId=1`** - Ukupne statistike
```bash
curl "http://localhost:3001/api/stats/overall?userId=1"
```

**GET `/api/stats/daily?userId=1&days=30`** - Dnevne statistike
```bash
curl "http://localhost:3001/api/stats/daily?userId=1&days=30"
```

## 🌐 Frontend

### User Selector

U header-u aplikacije sada postoji dropdown za izbor korisnika:

```jsx
<select onChange={(e) => setSelectedUserId(parseInt(e.target.value))}>
  {users.map(user => (
    <option key={user.id} value={user.id}>
      {user.display_name || user.name}
    </option>
  ))}
</select>
```

### Dodavanje Sesija

Prilikom dodavanja sesija možete:
1. **Unijeti ime korisnika** (automatski kreira novog ili koristi postojećeg)
2. **Koristiti trenutno izabranog korisnika**

### User Management Tab

Novi **"Korisnici"** tab omogućava:

#### Kreiranje Novog Korisnika

1. Kliknite na tab **"Korisnici"**
2. Kliknite **"Dodaj Korisnika"**
3. Popunite formu:
   - **Korisničko Ime** (obavezno, mora biti jedinstveno)
   - **Prikazno Ime** (opciono)
   - **Dnevni Cilj** (u minutama, default: 30)
4. Kliknite **"Kreiraj Korisnika"**

#### Pregled Korisnika

Lista pokazuje sve korisnike sa:
- Avatar inicijal
- Prikazno ime i korisničko ime
- Trenutni dnevni cilj

#### Uređivanje Korisnika

1. Kliknite ikonu **Edit** (olovka) pored korisnika
2. Promijenite dnevni cilj
3. Kliknite **Save** ili **X** za otkazivanje

#### Brisanje Korisnika

1. Kliknite ikonu **Trash** (korpa) pored korisnika
2. Potvrdite brisanje u dijalogu
3. **UPOZORENJE:** Sve sesije korisnika će biti trajno obrisane
4. Ne možete obrisati jedinog korisnika u sistemu

#### Primjer Korištenja

```
1. Kreirajte korisnika "Fahro" sa ciljem 45 minuta
2. Kreirajte korisnika "Marko" sa ciljem 30 minuta
3. Koristite user selector u header-u za prebacivanje
4. Svaki korisnik ima svoje statistike i nizove
```

## 📲 Viber/WhatsApp Integracija

### Prepoznavanje Korisnika

Sistem automatski prepoznaje korisničko ime iz Viber/WhatsApp poruka:

**Format poruke:**
```
Fahro:
Game 1. Chess Tactics
30m
Game 2. Opening Theory
25m 15s
```

**Što se dešava:**
1. Sistem parsira prvu liniju i prepoznaje "Fahro:" kao ime korisnika
2. Provjerava da li korisnik "Fahro" postoji
3. Ako ne postoji, kreira novog korisnika
4. Dodaje sve sesije tom korisniku

### Webhook Endpoint

```
POST /api/webhook/message
```

**Request:**
```json
{
  "message": "Fahro:\nGame 1. Test\n25m\nGame 2. Test\n15m"
}
```

**Response:**
```json
{
  "success": true,
  "message": "✅ Fahro: Zabilježeno 2 lekcija!",
  "sessions": [...],
  "user": "Fahro"
}
```

## 🎯 Primjeri Korištenja

### Scenario 1: Dva Prijatelja Uče Zajedno

**Fahro šalje:**
```
Fahro:
Game 1. Queen's Gambit Study
45m
Game 2. Tactical Puzzles
30m
```

**Marko šalje:**
```
Marko:
Game 1. Endgame Practice
1h 15m
```

**Rezultat:**
- Fahro: 2 sesije, ukupno 75 min
- Marko: 1 sesija, ukupno 75 min
- Svako ima svoje statistike i nizove

### Scenario 2: Grupna Viber/WhatsApp Konverzacija

```
[Fahro]: Fahro:
Game 1. Opening Study
25m

[Marko]: Marko:
Game 1. Tactics Training  
30m 15s

[Ana]: Ana:
Game 1. Endgame
45m
```

Svaki korisnik se automatski kreira i dobija svoje sesije!

## 🔐 Baza Podataka

### Schema

**users table:**
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT,
  daily_goal_minutes INTEGER DEFAULT 30,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
```

**sessions table:**
```sql
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  lesson_name TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  date TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
)
```

## 🚀 Migration

Ako već imate postojeću bazu sa starom shemom:

1. **Backup postojeće baze:**
```bash
cp ./data/study-tracker.db ./data/study-tracker.db.backup
```

2. **Obrišite staru bazu** (ili migration script - TODO):
```bash
rm ./data/study-tracker.db
```

3. **Restart aplikacije:**
```bash
docker-compose restart
```

Nova schema će biti automatski kreirana!

## 💡 Best Practices

1. **Konzistentan format imena** - Koristite isto ime u svim porukama
   ```
   ✅ "Fahro:" uvijek
   ❌ "Fahro:", "fahro:", "FAHRO:" mješano
   ```

2. **Jasna imena** - Koristite prepoznatljiva imena
   ```
   ✅ "Fahro", "Marko", "Ana"
   ❌ "User1", "Test", "Abc"
   ```

3. **Format sa ":"** - Uvijek dodajte ":" nakon imena
   ```
   ✅ "Fahro:\nGame 1..."
   ❌ "Fahro\nGame 1..."
   ```

## 🐛 Troubleshooting

### Problem: Sesije se dodaju pogrešnom korisniku

**Rješenje:** Provjerite format poruke - ime mora biti u prvoj liniji sa ":":
```
Fahro:
Game 1...
```

### Problem: Kreiran duplikat korisnika

**Rješenje:** Imena su UNIQUE - provjerite da li koristite isto ime (case-sensitive):
```sql
SELECT * FROM users;
```

### Problem: Ne mogu promijeniti korisnika u frontendu

**Rješenje:** Refresh stranicu ili provjerite da li ima više od jednog korisnika:
```bash
curl http://localhost:3001/api/users
```

## 📊 Statistike po Korisniku

Svaki korisnik ima:
- **Svoj dnevni cilj** - Može biti različit za svakog
- **Svoje nizove** - Trenutni i najduži niz
- **Svoje kaznene bodove** - Nezavisno praćenje
- **Svoje sesije** - Potpuno odvojeno

---

**Multi-user podrška omogućava timsko učenje i praćenje! 🎉**
