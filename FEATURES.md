# ✨ Study Tracker - Kompletna Lista Funkcionalnosti

## 📊 Dashboard & Statistike

### Trenutne Statistike
- **Ukupno Sesija** - Broj svih učioničkih sesija
- **Ukupno Vrijeme** - Zbirno vrijeme svih sesija (sati i minuti)
- **Trenutni Niz** - Koliko uzastopnih dana postižete cilj
- **Najduži Niz** - Vaš rekord uzastopnih uspješnih dana
- **Dani Aktivni** - Broj različitih dana sa sesijama
- **Kazneni Bodovi** - Broj penala za propuste

### Grafikon Aktivnosti (14 dana)
- Line chart sa dnevnim trajanjem učenja
- Vizualno označavanje dnevnog cilja
- Interaktivni tooltip sa detaljima

### Detaljan Pregled (30 dana)
Za svaki dan prikazuje:
- ✅ **Status** - Postignut cilj / Djelimičan / Propušten
- ⏱️ **Trajanje** - Ukupno vrijeme tog dana
- 📝 **Broj Sesija** - Koliko lekcija je odrađeno
- 🔥 **Niz** - Da li je dio trenutnog niza
- ⚠️ **Penal** - Ako je bilo 2+ uzastopna propusta

## 👥 User Management

### Kreiranje Korisnika

**Tri načina kreiranja:**

1. **Preko UI** (Korisnici tab)
   - Kliknite "Dodaj Korisnika"
   - Unesite korisničko ime (jedinstveno)
   - Dodajte prikazno ime (opciono)
   - Postavite dnevni cilj (minute)
   - Kliknite "Kreiraj Korisnika"

2. **Automatski iz Poruka**
   - Format: `Ime:\nLekcija\nTrajanje`
   - Korisnik se automatski kreira
   - Sesije se dodaju tom korisniku

3. **Preko API-ja**
   - POST request na `/api/users`
   - Programatski pristup

### User Selector
- Dropdown u header-u
- Prikazuje sve korisnike
- Brzo prebacivanje između korisnika
- Automatski refresh statistika

### User List
- Avatar sa inicijalima
- Prikazno ime i korisničko ime
- Dnevni cilj
- Datum kreiranja
- Edit opcija

### Edit Postavki
- Inline uređivanje dnevnog cilja
- Save/Cancel dugmići
- Instant feedback
- Automatski update statistika

## 📚 Dodavanje Sesija

### Metod 1: Manuelni Unos
```
Naziv Lekcije: "Game 1. Chess Tactics"
Trajanje: 1h 30m 45s
```
- Jednostavna forma
- Sati, minute, sekunde odvojeno
- Dodaje se trenutnom korisniku

### Metod 2: Batch Import (Copy-Paste)
```
Game 1. Steinitz W. - Lipke P.
18m 32s
Game 2. Schlechter C. - John W.
22m 11s
```
- Zalijepite cijelu poruku
- Automatsko parsiranje
- Dodavanje više sesija odjednom

### Metod 3: Sa Korisničkim Imenom
```
Fahro:
Game 1. Queen's Gambit
45m
Game 2. Tactics
30m
```
- Automatsko prepoznavanje korisnika
- Auto-create ako ne postoji
- Dodavanje tom korisniku

### Webhook Integracija
```bash
POST /api/webhook/message
{
  "message": "Fahro:\nGame 1\n30m"
}
```
- REST endpoint
- Viber/WhatsApp integracija
- Zapier/Make povezivanje

## 🎯 Postavke

### Dnevni Cilj
- Podešavanje minuta dnevno
- Per-user postavka
- Utiče na streak tracking
- Određuje status dana

### Tracking Rules
Automatski sistem prati:
1. **Uspješan Dan** - Postignut cilj
2. **Djelimičan Dan** - Radili, ali ispod cilja
3. **Propušten Dan** - Ništa nije rađeno
4. **Kazneni Bod** - 2+ uzastopna propusta

## 🔗 API Endpoints

### Users
```
GET    /api/users           - Lista svih korisnika
GET    /api/users/:id       - Pojedinačni korisnik
POST   /api/users           - Kreiranje novog
PUT    /api/users/:id       - Ažuriranje postavki
```

### Sessions
```
POST   /api/sessions                     - Dodavanje sesija
GET    /api/sessions?userId=X            - Sesije za korisnika
GET    /api/sessions?startDate=&endDate= - Filtriranje po datumu
```

### Statistics
```
GET    /api/stats/overall?userId=X      - Ukupne statistike
GET    /api/stats/daily?userId=X&days=N - Dnevne statistike
```

### Webhook
```
POST   /api/webhook/message - Viber/WhatsApp integracija
```

### Health
```
GET    /api/health - Status check
```

## 🎨 UI/UX Features

### Navigacija
- **Dashboard** - Pregled statistika
- **Dodaj Sesiju** - Unos novih sesija
- **Korisnici** - User management
- **Postavke** - Konfiguracija

### Responsive Design
- Mobile-friendly
- Tablet optimizovan
- Desktop full layout
- Touch-friendly kontrole

### Visual Feedback
- ✅ Success messages (zeleno)
- ❌ Error messages (crveno)
- ⏳ Loading states
- 📊 Real-time updates

### Color Coding
- 🟢 **Zeleno** - Cilj postignut
- 🟠 **Narančasto** - Djelimično
- ⚫ **Sivo** - Propušteno
- 🔴 **Crveno** - Kazneni bod

### Icons
- Lucide icons kroz cijelu aplikaciju
- Intuitivne vizuelne oznake
- Konzistentna ikonografija

## 🔥 Tracking Logic

### Streak Calculation
```javascript
Trenutni niz:
- Počinje od danas
- Ide unazad
- Prekida se prvim propustom
- Samo dani sa postignutim ciljem

Najduži niz:
- Maksimalni historical streak
- Svih vremena
- Tracka se kroz cijelu historiju
```

### Penalty Points
```javascript
Kazneni bod se dobija:
IF (danas.status === "propušten" AND 
    jučer.status === "propušten") {
  penalties++
}

Prikazuje se:
- Crveni "Penal" badge
- Broj kaznenih bodova
- Na dnevnom pregledu
```

### Daily Status
```javascript
status = calculateStatus(totalMinutes, goalMinutes) {
  if (totalMinutes === 0) return "missed"
  if (totalMinutes >= goalMinutes) return "achieved"
  return "partial"
}
```

## 📱 Message Formats

### Format 1: Sa Korisničkim Imenom
```
Fahro:
Game 1. Lesson Title
18m 32s
Game 2. Another Lesson
22m 11s
```

### Format 2: Bez Imena
```
Game 1. Lesson Title
18m 32s
Game 2. Another Lesson
22m 11s
```

### Format 3: Samo Trajanje
```
Game 1
30m
```

### Supported Duration Formats
- `1h 30m 45s` - Sati, minute, sekunde
- `1h 30m` - Sati i minute
- `45m 30s` - Minute i sekunde
- `30m` - Samo minute
- `45s` - Samo sekunde

## 🐳 Docker Features

### Production Mode
```bash
docker-compose up -d
```
- Multi-stage build
- Optimizovan image
- Health checks
- Auto-restart
- Volume persistence

### Development Mode
```bash
docker-compose --profile dev up app-dev
```
- Hot reload enabled
- Source code mounting
- Dev dependencies
- Debug mode

### Commands
```bash
make build   # Build image
make up      # Start containers
make down    # Stop containers
make logs    # View logs
make shell   # Enter container
make clean   # Clean everything
```

## 💾 Data Persistence

### Database Location
```
./data/study-tracker.db
```

### Volume Mounting
```yaml
volumes:
  - ./data:/app/data
```

### Backup & Restore
```bash
# Backup
cp ./data/study-tracker.db backup.db

# Restore
docker-compose down
cp backup.db ./data/study-tracker.db
docker-compose up -d
```

## 🔐 Security Features

### Input Validation
- Username uniqueness check
- Required field validation
- Type checking
- SQL injection prevention (prepared statements)

### Error Handling
- Graceful error messages
- User-friendly feedback
- No sensitive data exposure
- Proper HTTP status codes

## 🚀 Performance

### Optimizations
- Database indexes on user_id and date
- Efficient query patterns
- Minimal re-renders in React
- Optimized Docker images

### Caching
- User data cached in frontend
- Minimal API calls
- Smart refresh on changes

## 📊 Data Visualization

### Charts (Recharts)
- Line chart za aktivnost
- Smooth animations
- Interactive tooltips
- Responsive sizing
- Custom styling

### Tables
- Sortable columns
- Filterable data
- Pagination ready
- Responsive layout

## 🎯 Use Cases

### Scenario 1: Solo Learner
```
1. Kreirajte svoj account
2. Postavite dnevni cilj
3. Dodajte sesije dnevno
4. Pratite svoj napredak
5. Održavajte nizove
```

### Scenario 2: Study Group
```
1. Svaki član kreira account
2. Šalju poruke u grupu
3. Webhook automatski tracka
4. Svako vidi svoj progres
5. Friendly competition
```

### Scenario 3: Teacher/Mentor
```
1. Kreirajte accounte za studente
2. Postavljajte različite ciljeve
3. Pratite individualni napredak
4. Identifikujte ko zaostaje
5. Podržite kroz statistike
```

## 🔮 Roadmap Features (Planned)

### v2.2.0
- [ ] Export data (CSV, JSON)
- [ ] Import existing data
- [ ] User avatars (upload)
- [ ] Dark mode theme
- [ ] Custom color schemes

### v2.3.0
- [ ] Group statistics
- [ ] Leaderboards
- [ ] Shared goals
- [ ] Comments on sessions
- [ ] Tags for lessons

### v3.0.0
- [ ] Mobile app (React Native)
- [ ] Real-time sync
- [ ] AI insights
- [ ] Gamification (badges, achievements)
- [ ] Multiple platform integration

---

**Study Tracker v2.1.0 - Kompletno dokumentovano! 📚🎯**
