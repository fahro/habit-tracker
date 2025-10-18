# Najnovije Izmjene - 18. Oktobar 2025

## 🔐 Password Zaštita za Brisanje Korisnika

### Šta je Dodano
- Obavezna šifra za brisanje korisnika: **`nikadporazsamolekcija`**
- Password input polje u delete confirmation dialogu
- Backend validacija šifre prije brisanja
- Disabled button dok se ne unese šifra

### Zašto
- Dodatna sigurnost protiv slučajnog brisanja
- Prevencija neovlaštenog brisanja korisnika

### Kako Koristiti
1. Kliknite na ikonu korpe za brisanje korisnika
2. Unesite šifru: `nikadporazsamolekcija`
3. Kliknite "Obriši Korisnika"

---

## 💾 Railway Volume - Čuvanje Podataka

### Problem Riješen
- Podaci su se gubili nakon svakog deploya na Railway
- SQLite baza je bila u memoriji kontejnera

### Rješenje
- Dodan **persistent volume** u `railway.toml`
- Volume mount: `/app/data` → `database_volume`
- Baza se sada čuva između deploya

### Konfiguracija

**railway.toml:**
```toml
[[deploy.volumes]]
mountPath = "/app/data"
name = "database_volume"
```

### Rezultat
✅ Svi podaci ostaju sačuvani nakon:
- Redeploy
- Restart kontejnera
- Git push sa novim kodom

---

## 👤 Editovanje Korisnika - Samo Prikazno Ime

### Šta je Promijenjeno
- **UKLONJENO**: Mogućnost editovanja dnevnog cilja kod postojećih korisnika
- **DODANO**: Editovanje samo prikaznog imena

### Prije
```
Edit korisnika:
- Prikazno ime ✓
- Dnevni cilj (minute) ✓
```

### Sada
```
Edit korisnika:
- Prikazno ime ✓
- Dnevni cilj (minute) ✗ (postavlja se mjesečno u Postavkama)
```

### API Promjene

**Prije:**
```javascript
PUT /api/users/:userId
{ dailyGoalMinutes: 30 }
```

**Sada:**
```javascript
PUT /api/users/:userId
{ displayName: "Fahro Mehmedović" }
```

---

## 📝 Kreiranje Korisnika - Bez Dnevnog Cilja

### Šta je Uklonjeno
- Polje "Dnevni Cilj (minute)" iz forme za kreiranje korisnika

### Zašto
- Dnevni cilj se sada postavlja **globalno** za sve korisnike
- Postavlja se u **Postavkama** na **mjesečnom nivou**
- Pojednostavljuje kreiranje korisnika

### Forma Prije
```
1. Korisničko ime *
2. Prikazno ime
3. Dnevni cilj (minute) *  ← UKLONJENO
```

### Forma Sada
```
1. Korisničko ime *
2. Prikazno ime
```

---

## 🎭 Seed Script - Demo Korisnici

### Nova Skripta: `seed-treniram-demo.sh`

Generiše **3 demo korisnika** sa **3 mjeseca podataka** na Railway:

#### Korisnici:
1. **🌟 Odličan Hamo**
   - Radi ~90% dana
   - Minimalno penala
   - Dosljedno učenje

2. **😊 Solidni Suljo**
   - Radi ~75% dana
   - Poneki penal
   - Dobar učenik

3. **😴 Lijeni Mujo**
   - Radi ~40-50% dana
   - Više penala
   - Nedosljedan

#### Podaci:
- **3 mjeseca** unazad od trenutnog datuma
- Mjesečni cilj: **30 minuta** za sve mjesece
- Automatski generiše propuste za penale

#### Upotreba:
```bash
./seed-treniram-demo.sh
```

URL: `https://treniram.up.railway.app`

---

## 📚 Nova Dokumentacija

### 1. `RAILWAY-VOLUME-SETUP.md`
- Detaljna dokumentacija Railway volume konfiguracije
- Kako volume radi
- Backup i restore instrukcije
- Troubleshooting

### 2. `DELETE-PASSWORD.md`
- Dokumentacija password zaštite
- UI komponente i flow
- Sigurnosne karakteristike
- Buduća poboljšanja

### 3. `CHANGELOG-LATEST.md` (ovaj dokument)
- Sažetak svih promjena
- Kako koristiti nove feature-e

---

## 🚀 Deployment

### Railway Automatski Deploy
1. Git push automatski pokreće deploy
2. Railway koristi `Dockerfile.railway`
3. Volume se automatski mount-uje
4. Podaci ostaju sačuvani ✅

### Prvi Deploy sa Volumeom
Nakon prvog deploya sa volume konfiguracijom:
1. Railway kreira `database_volume`
2. Mount-uje ga na `/app/data`
3. SQLite kreira `study-tracker.db` u tom folderu
4. Volume persists između deploya

---

## ⚙️ Backend Promjene

### Nova Funkcija: `updateUserDisplayName()`
```javascript
// server/database.js
export function updateUserDisplayName(userId, displayName) {
  db.prepare('UPDATE users SET display_name = ? WHERE id = ?')
    .run(displayName, userId);
}
```

### Password Validacija u DELETE Endpoint
```javascript
// server/index.js
app.delete('/api/users/:userId', (req, res) => {
  const { password } = req.body;
  
  const ADMIN_PASSWORD = 'nikadporazsamolekcija';
  if (password !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: 'Pogrešna šifra' });
  }
  
  // ... brisanje korisnika
});
```

---

## 🎨 Frontend Promjene

### UserManagement Komponenta

**Novi State:**
```javascript
const [deletePassword, setDeletePassword] = useState('')
```

**Delete Dialog sa Password Input:**
```jsx
<input
  type="password"
  value={deletePassword}
  onChange={(e) => setDeletePassword(e.target.value)}
  placeholder="Unesite šifru"
/>
```

**Disabled Button Logika:**
```javascript
disabled={loading || !deletePassword}
```

---

## 📊 Statistika Promjena

```
7 fajlova promijenjeno
588 linija dodato
20 linija obrisano

Dodano:
- DELETE-PASSWORD.md
- RAILWAY-VOLUME-SETUP.md
- seed-treniram-demo.sh

Izmijenjeno:
- railway.toml
- server/database.js
- server/index.js
- src/components/UserManagement.jsx
```

---

## ✅ Testiranje

### Lokalno
```bash
npm run dev
```

1. Testiraj kreiranje korisnika bez dnevnog cilja
2. Testiraj editovanje prikaznog imena
3. Testiraj brisanje sa pogrešnom šifrom
4. Testiraj brisanje sa ispravnom šifrom

### Production (Railway)
1. Push na GitHub
2. Railway automatski deploy-uje
3. Testiraj da podaci ostaju nakon redeploy-a
4. Testiraj sve funkcionalnosti

---

## 🔒 Sigurnost

### Implementirane Mjere
- ✅ Password zaštita za brisanje
- ✅ Backend validacija šifre
- ✅ Frontend disabled button bez šifre
- ✅ Clear password state nakon akcije

### Buduća Poboljšanja
- Environment variable za password
- Password hashing
- Rate limiting
- Audit log

---

## 📝 Napomene

⚠️ **Važno**:
- Railway volume se **NE BRIŠE** automatski
- Za reset baze, manualno obrišite volume u Railway dashboardu
- Šifra je case-sensitive: `nikadporazsamolekcija`
- Volume se mount-uje samo na production (Railway)

---

## 🎯 Sljedeći Koraci

Preporučeni sljedeći koraci:
1. Postaviti demo korisnike na Railway
2. Testirati sve funkcionalnosti
3. Razmotriti environment variable za password
4. Implementirati backup strategiju
5. Dodati monitoring za volume usage
