# 🗑️ User Deletion Guide

## Pregled

Study Tracker sada podržava **sigurno brisanje korisnika** sa potvrdom i automatskim cascade delete-om svih povezanih podataka.

## ✨ Funkcionalnosti

### 🔒 Sigurnosne Mjere

1. **Confirmation Dialog** - Uvijek traži potvrdu prije brisanja
2. **Last User Protection** - Ne možete obrisati jedinog korisnika u sistemu
3. **Cascade Delete** - Sve sesije korisnika se automatski brišu
4. **Non-existent User Check** - API vraća error za nepostojeće korisnike
5. **Auto User Switch** - Automatski prebacuje na drugog korisnika ako je trenutni obrisan

### 🎨 UI Komponente

#### Delete Button
- **Lokacija:** Pored Edit ikonice u user listi
- **Ikona:** Crvena trash/korpa ikona
- **Hover Effect:** Svijetlo crvena pozadina
- **Disabled:** Nikada (uvijek klikabilan)

#### Confirmation Dialog
```
┌──────────────────────────────────────┐
│  🗑️  Potvrda Brisanja                │
│  Ova akcija se ne može poništiti     │
├──────────────────────────────────────┤
│                                      │
│  Da li ste sigurni da želite        │
│  obrisati korisnika [Ime]?          │
│                                      │
│  ⚠️ UPOZORENJE:                      │
│  Sve sesije ovog korisnika će       │
│  biti trajno obrisane.              │
│                                      │
├──────────────────────────────────────┤
│  [Obriši Korisnika]    [Otkaži]     │
└──────────────────────────────────────┘
```

**Elementi:**
- **Header** - Ikona + naslov + podnaslov
- **Confirmation Text** - Jasna poruka sa imenom korisnika
- **Warning Box** - Žuti alert sa upozorenjem
- **Action Buttons** - Crveni Delete + Grey Cancel
- **Background Overlay** - Polu-transparentna crna pozadina (backdrop)

## 🔧 Kako Funkcioniše

### Frontend Flow

```javascript
1. Korisnik klikne Trash ikonu
   ↓
2. setDeletingUser(user) - Otvara modal
   ↓
3. Prikazuje se confirmation dialog
   ↓
4. Korisnik klikne "Obriši Korisnika"
   ↓
5. handleDeleteUser(userId) - API poziv
   ↓
6. DELETE /api/users/:userId
   ↓
7. Success → Zatvori modal, refresh user list
   ↓
8. handleUsersUpdated() - Provjeri ako je trenutni user obrisan
   ↓
9. Automatski prebaci na prvog dostupnog korisnika
```

### Backend Flow

```javascript
1. Primi DELETE request
   ↓
2. Provjeri da li user postoji
   ↓ (NE)
   └→ Error 404: "Korisnik nije pronađen"
   ↓ (DA)
3. Provjeri broj korisnika
   ↓ (length === 1)
   └→ Error 400: "Ne možete obrisati jedinog korisnika"
   ↓ (length > 1)
4. deleteUser(userId)
   ├→ DELETE FROM sessions WHERE user_id = ?
   └→ DELETE FROM users WHERE id = ?
   ↓
5. Return Success: "Korisnik uspješno obrisan"
```

## 📊 Database Operacije

### Cascade Delete Query

```sql
-- 1. Obriši sve sesije korisnika
DELETE FROM sessions WHERE user_id = ?;

-- 2. Obriši korisnika
DELETE FROM users WHERE id = ?;
```

**BITNO:** Ove operacije moraju biti u ovom redoslijedu zbog foreign key odnosa.

## 🚫 Validacije

### 1. User Doesn't Exist
```bash
DELETE /api/users/9999
```

Response (404):
```json
{
  "error": "Korisnik nije pronađen"
}
```

### 2. Last User Protection
```bash
# Kada ima samo 1 korisnik
DELETE /api/users/1
```

Response (400):
```json
{
  "error": "Ne možete obrisati jedinog korisnika"
}
```

### 3. Success
```bash
DELETE /api/users/5
```

Response (200):
```json
{
  "success": true,
  "message": "Korisnik uspješno obrisan"
}
```

## 🧪 Testiranje

### Automatski Test

```bash
./test-delete-user.sh
```

**Test Scenarios:**
1. ✅ Kreiranje test korisnika
2. ✅ Dodavanje sesija test korisniku
3. ✅ Brisanje non-existent korisnika (should fail)
4. ✅ Brisanje korisnika sa sesijama
5. ✅ Verifikacija cascade delete-a
6. ✅ Pokušaj brisanja jedinog korisnika (should fail)

### Manuelno Testiranje

1. **Kreiraj test korisnike:**
   - Korisnici tab → Dodaj Korisnika
   - Kreiraj 2-3 korisnika

2. **Dodaj sesije:**
   - Dodaj Sesiju tab
   - Unesi par sesija za različite korisnike

3. **Probaj brisanje:**
   - Korisnici tab
   - Klikni trash ikonu
   - Pregledaj confirmation dialog
   - Potvrdi ili otkaži

4. **Verifikuj rezultate:**
   - Provjeri da li je korisnik obrisan
   - Provjeri da li su sesije obrisane
   - Provjeri da li je user selector ažuriran

## 🎯 Use Cases

### Scenario 1: Uklanjanje Test Korisnika

```
Problem: Kreirali ste test korisnika "TestUser" za eksperiment

Rješenje:
1. Korisnici tab
2. Pronađi "TestUser"
3. Klikni trash ikonu
4. Potvrdi brisanje
✅ Test korisnik i sve njegove sesije obrisani
```

### Scenario 2: Student Napušta Grupu

```
Problem: Student "Marko" više ne učestvuje u grupi

Rješenje:
1. Korisnici tab
2. Pronađi "Marko"
3. Klikni trash ikonu
4. Potvrdi brisanje
✅ Markove sesije obrisane, ostali studenti ostaju
```

### Scenario 3: Brisanje Neaktivnog Korisnika

```
Problem: Korisnik "InactiveUser" nema aktivnosti 6 mjeseci

Rješenje:
1. Korisnici tab
2. Pronađi "InactiveUser"
3. Klikni trash ikonu
4. Potvrdi brisanje
✅ Neaktivni korisnik očišćen iz sistema
```

## ⚠️ Upozorenja

### 🔴 TRAJNO BRISANJE

**NEMA UNDO!** Brisanje je **permanentno** i **ne može se poništiti**.

Prije brisanja:
- ✅ Provjeri da li ste izabrali pravog korisnika
- ✅ Razmislite da li vam trebaju podaci
- ✅ Napravite backup ako je potrebno

### 📦 Backup Prije Brisanja

```bash
# Backup cijele baze
cp ./data/study-tracker.db ./backups/backup-$(date +%Y%m%d).db

# Ili via Docker
docker exec study-tracker cat /app/data/study-tracker.db > backup.db
```

### 🔄 Recovery

Jedini način da povratite obrisanog korisnika:

1. **Restore iz backupa**
   ```bash
   docker-compose down
   cp backup.db ./data/study-tracker.db
   docker-compose up -d
   ```

2. **Kreiraj ponovo ručno**
   - Korisnik sa istim imenom
   - Manuelno unesite sesije (ako ih imate zabilježene)

## 🔐 Sigurnosne Preporuke

### Za Production

1. **Regular Backups**
   ```bash
   # Cron job - svaki dan u 3 AM
   0 3 * * * /path/to/backup-script.sh
   ```

2. **Role-Based Access**
   - Razmislite o implementaciji user roles
   - Admin role za brisanje
   - Regular users ne mogu brisati

3. **Soft Delete** (Future Enhancement)
   ```sql
   -- Umjesto DELETE, označite kao deleted
   UPDATE users SET deleted_at = NOW() WHERE id = ?;
   ```

4. **Audit Log** (Future Enhancement)
   ```sql
   -- Log brisanja za tracking
   INSERT INTO audit_log (action, user_id, deleted_by, timestamp)
   VALUES ('DELETE_USER', ?, ?, NOW());
   ```

## 📚 API Reference

### DELETE /api/users/:userId

**Request:**
```http
DELETE /api/users/5 HTTP/1.1
Host: localhost:3001
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Korisnik uspješno obrisan"
}
```

**Response (Not Found - 404):**
```json
{
  "error": "Korisnik nije pronađen"
}
```

**Response (Last User - 400):**
```json
{
  "error": "Ne možete obrisati jedinog korisnika"
}
```

**Response (Server Error - 500):**
```json
{
  "error": "Internal server error"
}
```

## 🎨 Styling Reference

### Delete Button

```jsx
<button
  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
  title="Obriši korisnika"
>
  <Trash2 className="w-4 h-4 text-red-600" />
</button>
```

### Modal Overlay

```jsx
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
  {/* Modal Content */}
</div>
```

### Warning Box

```jsx
<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
  <p className="text-sm text-yellow-800">
    ⚠️ <strong>Upozorenje:</strong> Poruka...
  </p>
</div>
```

## 💡 Best Practices

### Kada Brisati Korisnika

✅ **DOBRO:**
- Test korisnici nakon testiranja
- Neaktivni korisnici (6+ mjeseci)
- Duplirani accounti
- Pogrešno kreirani korisnici

❌ **LOŠE:**
- Korisnici sa važnim historijskim podacima
- Trenutno aktivni korisnici
- Jedini korisnik u sistemu
- Bez backupa

### Communication

Prije brisanja korisnika u production:
1. 📧 Obavijestite korisnika
2. 📊 Ponudite export podataka
3. ⏰ Dajte grace period (7-30 dana)
4. 💾 Napravite backup
5. ✅ Dobijte pisanu potvrdu

---

**User Deletion - Sigurno, Jednostavno, Efikasno! 🗑️✅**
