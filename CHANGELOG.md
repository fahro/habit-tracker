# 📝 Changelog

## [2.2.0] - 2025-10-18

### ✨ New Features

#### 🗑️ User Deletion
- **Delete User Button** - Ikona za brisanje pored svakog korisnika
- **Confirmation Dialog** - Modal sa upozorenjem prije brisanja
- **Cascade Delete** - Automatsko brisanje svih sesija korisnika
- **Last User Protection** - Ne možete obrisati jedinog korisnika
- **Auto User Switch** - Automatski prebacivanje na drugog korisnika nakon brisanja trenutnog

#### 🔧 API Endpoints
- `DELETE /api/users/:userId` - Endpoint za brisanje korisnika
- Validacija: Ne dozvoljava brisanje nepostojećeg korisnika
- Validacija: Ne dozvoljava brisanje jedinog korisnika

#### 🎨 UI/UX Improvements
- Crvena trash ikona sa hover efektom
- Full-screen modal dialog sa pozadinom
- Warning badge u confirmation dijalogu
- Loading states tokom brisanja
- Success/Error notifikacije

### 📚 Documentation
- Ažuriran MULTI-USER.md sa user deletion sekcijom
- DELETE endpoint dokumentovan sa primjerima
- test-delete-user.sh - Automatski test script

### 🐛 Bug Fixes
- Fixed selected user handling nakon brisanja
- Cascade delete sesija implementiran

---

## [2.1.0] - 2025-10-17

### ✨ New Features

#### 👥 User Management UI
- **User Creation Form** - UI za kreiranje novih korisnika
- **User List View** - Pregled svih korisnika sa avatarima
- **Edit User Settings** - Inline uređivanje dnevnog cilja
- **User Tab** - Novi "Korisnici" tab u navigaciji
- **Duplicate Prevention** - API validation za jedinstvena imena
- **Avatar Initials** - Automatski generisani avatari sa inicijalima

#### 🎨 UI Improvements
- User selector u header-u
- Avatar display za korisnike
- Inline edit funkcionalnost
- Responsive user cards
- Success/Error notifications

#### 🔧 API Improvements
- `POST /api/users` validation - Provjera dupliciranih imena
- Better error messages
- User existence check prije kreiranja

### 📚 Documentation
- Ažuriran QUICKSTART.md sa User Management sekcijom
- Ažuriran MULTI-USER.md sa detaljnim uputstvima
- test-user-management.sh - Test script za user management

### 🐛 Bug Fixes
- Fixed duplicate user creation returning success
- Improved error handling u user creation

---

## [2.0.0] - 2025-10-17

### 🎉 Major Features

#### 👥 Multi-User Support
- **Automatsko kreiranje korisnika** - Novi korisnici se kreiraju automatski pri prvom unosu
- **Prepoznavanje iz poruka** - Sistem prepoznaje korisničko ime iz formata `Ime:` u porukama
- **User selector u frontendu** - Dropdown za lako prebacivanje između korisnika
- **Odvojene statistike** - Svaki korisnik ima svoje statistike, nizove i kaznene bodove
- **Unique imena** - Svaki korisnik mora imati jedinstveno ime

#### 📊 Database Schema Update
- Dodato `display_name` polje za korisnike
- `name` polje sada ima UNIQUE constraint
- Uklonjen "Default User" - korisnici se kreiraju on-demand

#### 🔧 API Enhancements

**Novi Endpoints:**
- `GET /api/users` - Lista svih korisnika
- `GET /api/users/:userId` - Pojedinačni korisnik
- `POST /api/users` - Kreiranje novog korisnika
- `PUT /api/users/:userId` - Ažuriranje postavki korisnika

**Ažurirani Endpoints:**
- `POST /api/sessions` - Sada podržava `username` parametar
- `GET /api/sessions?userId=X` - Filtriranje po korisniku
- `GET /api/stats/overall?userId=X` - Statistike po korisniku
- `GET /api/stats/daily?userId=X` - Dnevne statistike po korisniku
- `POST /api/webhook/message` - Automatski prepoznaje korisnika iz poruke

#### 🎨 Frontend Updates
- User selector u header-u
- Automatski refresh korisnika nakon dodavanja sesija
- Polje za unos imena korisnika u "Dodaj Sesiju"
- Prikaz trenutnog korisnika u header-u

#### 📚 Documentation
- **MULTI-USER.md** - Kompletna multi-user dokumentacija
- **CHANGELOG.md** - Ovaj fajl
- Ažuriran **README.md** sa multi-user sekcijom
- Ažuriran **QUICKSTART.md** sa multi-user primjerima
- **test-multi-user.sh** - Automatski test script

### 🐳 Docker

#### Production Ready
- Multi-stage Docker build optimizovan
- Health check implementiran
- Persistent volumes za podatke
- Development i production profili

### 🔄 Migration Notes

**Za postojeće instalacije:**

1. **Backup postojeće baze:**
   ```bash
   cp ./data/study-tracker.db ./data/study-tracker.db.backup
   ```

2. **Prebacite se na novu verziju:**
   ```bash
   git pull
   docker-compose down
   docker-compose build
   docker-compose up -d
   ```

3. **Stara baza neće automatski migrirati** - sistem će kreirati novu shemu

### ⚡ Performance

- Dodati database indeksi za brže upite
- Optimizovano parsiranje poruka
- Cache-ovani korisnici u frontend state-u

### 🐛 Bug Fixes

- Fixed SQL syntax error sa string literals
- Fixed JSX struktura u App.jsx
- Fixed user creation returning null
- Uklonjen debug logging iz produkcije

---

## [1.0.0] - 2025-10-17

### ✨ Initial Release

#### Core Features
- 📊 Dashboard sa statistikama
- ✅ Praćenje study sesija
- 🔥 Streak tracking
- ⚠️ Kazneni bodovi za propuste
- 🎯 Fleksibilni dnevni ciljevi
- 🔗 Webhook integracija za Viber/WhatsApp

#### Tech Stack
- **Frontend:** React, Vite, TailwindCSS, Recharts
- **Backend:** Node.js, Express
- **Database:** SQLite (better-sqlite3)
- **Deployment:** Docker, Railway ready

#### Documentation
- README.md sa komplenom dokumentacijom
- QUICKSTART.md za brzo pokretanje
- DOCKER.md sa Docker instrukcijama

---

## Future Roadmap 🚀

### v2.1.0 (Planned)
- [ ] Export podataka (CSV, JSON)
- [ ] Import postojećih podataka
- [ ] User avatari
- [ ] Custom themes (dark mode)
- [ ] Push notifications

### v2.2.0 (Planned)
- [ ] Grupne statistike (rangiranje korisnika)
- [ ] Shared goals između korisnika
- [ ] Comments na sesijama
- [ ] Tags za organizaciju lekcija

### v3.0.0 (Planned)
- [ ] Mobile aplikacija (React Native)
- [ ] Real-time collaboration
- [ ] AI insights i preporuke
- [ ] Gamification (achievements, badges)
- [ ] Integration sa više platformi (Telegram, Discord)

---

**Hvala što koristite Study Tracker! 📚🎯**
