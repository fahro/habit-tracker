# 📅 Mjesečni Globalni Ciljevi - Dokumentacija

## 🎯 Nova Funkcionalnost

Dnevni ciljevi su sada **GLOBALNI** i podešavaju se **PO MJESECU** za **SVE korisnike**.

### Prije (User-Specific)
- ❌ Svaki korisnik ima svoj dnevni cilj
- ❌ Cilj se ne mijenja mjesečno
- ❌ Teško uporediti korisnike

### Sada (Monthly Global)
- ✅ Jedan cilj za SVE korisnike
- ✅ Cilj se može podešavati po mjesecu
- ✅ Lako uporediti performanse
- ✅ Horizontalna linija cilja na grafu

## 📊 Database Schema

### Nova Tabela: `monthly_settings`

```sql
CREATE TABLE monthly_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,  -- 0-11 (Januar=0)
  daily_goal_minutes INTEGER NOT NULL DEFAULT 30,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(year, month)
);
```

**Primjer podataka:**
```
| year | month | daily_goal_minutes |
|------|-------|-------------------|
| 2025 | 9     | 30                | (Oktobar 2025)
| 2025 | 8     | 45                | (Septembar 2025)
| 2025 | 10    | 60                | (Novembar 2025)
```

## 🔧 Backend Changes

### Database Functions

```javascript
// Get monthly goal (default 30 if not set)
export function getMonthlyGoal(year, month) {
  const setting = db.prepare(
    'SELECT daily_goal_minutes FROM monthly_settings WHERE year = ? AND month = ?'
  ).get(year, month);
  return setting ? setting.daily_goal_minutes : 30;
}

// Set monthly goal (upsert)
export function setMonthlyGoal(year, month, dailyGoalMinutes) {
  db.prepare(`
    INSERT INTO monthly_settings (year, month, daily_goal_minutes)
    VALUES (?, ?, ?)
    ON CONFLICT(year, month) 
    DO UPDATE SET daily_goal_minutes = excluded.daily_goal_minutes
  `).run(year, month, dailyGoalMinutes);
  
  return getMonthlyGoal(year, month);
}

// Get all settings
export function getAllMonthlySettings() {
  return db.prepare(
    'SELECT * FROM monthly_settings ORDER BY year DESC, month DESC'
  ).all();
}
```

### Updated Logic

**getDailyStats:**
```javascript
for (let d = new Date(endDate); d >= effectiveStartDate; d.setDate(d.getDate() - 1)) {
  const dateStr = d.toISOString().split('T')[0];
  const data = dateMap.get(dateStr);
  
  // Get monthly goal for THIS SPECIFIC DATE
  const year = d.getFullYear();
  const month = d.getMonth();
  const dailyGoalMinutes = getMonthlyGoal(year, month);
  const dailyGoalSeconds = dailyGoalMinutes * 60;
  
  const metGoal = totalSeconds >= dailyGoalSeconds;
  // ...
}
```

**getOverallStats:**
```javascript
// Get CURRENT month's goal for display
const now = new Date();
const currentMonthGoal = getMonthlyGoal(now.getFullYear(), now.getMonth());

return {
  // ...
  dailyGoalMinutes: currentMonthGoal // Not user-specific!
};
```

## 🌐 API Endpoints

### GET `/api/settings/monthly/:year/:month`

Dohvata cilj za specifični mjesec.

**Request:**
```bash
GET /api/settings/monthly/2025/9
```

**Response:**
```json
{
  "year": 2025,
  "month": 9,
  "dailyGoalMinutes": 30
}
```

### POST `/api/settings/monthly`

Postavlja cilj za mjesec.

**Request:**
```bash
POST /api/settings/monthly
Content-Type: application/json

{
  "year": 2025,
  "month": 10,
  "dailyGoalMinutes": 45
}
```

**Response:**
```json
{
  "year": 2025,
  "month": 10,
  "dailyGoalMinutes": 45,
  "message": "Mjesečni cilj uspješno postavljen"
}
```

### GET `/api/settings/monthly`

Dohvata sve postavke.

**Response:**
```json
[
  {"id": 1, "year": 2025, "month": 10, "daily_goal_minutes": 45},
  {"id": 2, "year": 2025, "month": 9, "daily_goal_minutes": 30}
]
```

## 🎨 Frontend Changes

### Dashboard Component

**Učitavanje mjesečnog cilja:**
```javascript
const [monthlyGoal, setMonthlyGoal] = useState(30)

useEffect(() => {
  fetch(`/api/settings/monthly/${selectedYear}/${selectedMonth}`)
    .then(res => res.json())
    .then(data => setMonthlyGoal(data.dailyGoalMinutes))
}, [selectedMonth, selectedYear])
```

**Horizontalna linija na grafu:**
```jsx
<ReferenceLine 
  y={monthlyGoal} 
  stroke="#3b82f6" 
  strokeWidth={2}
  strokeDasharray="5 5"
  label={{ 
    value: `Cilj: ${monthlyGoal}m`, 
    position: 'right',
    fill: '#3b82f6'
  }}
/>
```

**Rezultat:**
- Plava isprekidana horizontalna linija
- Label "Cilj: 30m" desno
- Ažurira se kada promijenite mjesec

### Settings Panel

**Globalne postavke:**
```jsx
<h2>Globalne Postavke</h2>

<div className="bg-blue-50">
  📌 Ove postavke važe za SVE korisnike za izabrani mjesec.
</div>

<select onChange={handleMonthChange}>
  <option>Oktobar 2025</option>
  <option>Novembar 2025</option>
  ...
</select>

<input 
  type="number" 
  value={dailyGoal}
  label="Dnevni Cilj za Oktobar 2025 (minuta)"
/>
```

## 📋 Use Cases

### Use Case 1: Podešavanje Različitih Ciljeva Po Mjesecu

**Scenario:**
- Septembar: Početak godine, lakši cilj (30m)
- Oktobar-Decembar: Redovan rad (45m)
- Januar: Praznici, niži cilj (25m)

**Implementacija:**
1. Settings → Izaberi "Septembar 2025" → 30m → Sačuvaj
2. Settings → Izaberi "Oktobar 2025" → 45m → Sačuvaj
3. Settings → Izaberi "Januar 2026" → 25m → Sačuvaj

**Rezultat:**
- Svi korisnici se prilagođavaju mjesečnim ciljevima
- Dashboard automatski prikazuje tačan cilj za izabrani mjesec
- Graf ima horizontalnu liniju na pravom nivou

### Use Case 2: Uporedivanje Korisnika

**Scenario:**
- Hamo, Suljo i Mujo svi imaju isti cilj
- Mogu se fer uporediti

**Dashboard:**
```
Hamo:  ✅ 28/30 dana postignut cilj (30m)
Suljo: 🟠 24/30 dana postignut cilj (30m)
Mujo:  🔴 20/30 dana postignut cilj (30m)
```

### Use Case 3: Planiranje Budućnosti

**Scenario:**
- Sada je Oktobar
- Želite da podesite cilj za Novembar unaprijed

**Steps:**
1. Settings → Izaberi "Novembar 2025"
2. Trenutni cilj: 30m (default)
3. Postavite: 60m
4. Sačuvaj

**Rezultat:**
- Od 1. novembra, svi korisnici će imati cilj 60m
- Graf će automatski prikazati novu liniju

## 🎯 Horizontalna Linija Cilja

### Kako Izgleda

```
Aktivnost (Oktobar 2025)

60m |                                   ┄┄┄┄┄┄┄┄┄ Cilj: 30m
50m |     ▓▓▓▓
40m |     ▓▓▓▓     ▓▓▓▓
30m |┄┄┄┄┄▓▓▓▓┄┄┄┄┄▓▓▓▓┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
20m |▓▓▓▓ ▓▓▓▓ ▓▓▓▓▓▓▓▓     ▓▓▓▓
10m |▓▓▓▓ ▓▓▓▓ ▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓▓ ▓▓▓▓
    └─────────────────────────────────
     1    5    10   15   20   25   30
```

### Boje

- **Linija:** Plava (#3b82f6)
- **Style:** Isprekidana (dash array: "5 5")
- **Width:** 2px
- **Label:** "Cilj: 30m" (desno)

## 🔄 Migration Notes

### Postojeći Korisnici

Ako već imate korisnike sa user-specific ciljevima:

1. **Baza ostaje** - `users.daily_goal_minutes` field i dalje postoji
2. **Ignoriše se** - Više se ne koristi u kalkulacijama
3. **Novi sistem** - Koristi se `monthly_settings`

### Default Vrijednosti

Ako mjesečni cilj nije postavljen:
- Default: **30 minuta**
- Automatski se koristi
- Možete kasnije postaviti

## 🧪 Testing

### Test 1: Postavljanje Mjesečnog Cilja

```bash
curl -X POST http://localhost:3001/api/settings/monthly \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2025,
    "month": 10,
    "dailyGoalMinutes": 45
  }'
```

**Expected:**
```json
{
  "year": 2025,
  "month": 10,
  "dailyGoalMinutes": 45,
  "message": "Mjesečni cilj uspješno postavljen"
}
```

### Test 2: Dohvatanje Cilja

```bash
curl http://localhost:3001/api/settings/monthly/2025/10
```

**Expected:**
```json
{
  "year": 2025,
  "month": 10,
  "dailyGoalMinutes": 45
}
```

### Test 3: UI Testing

1. **Settings Page:**
   - Izaberite "Novembar 2025"
   - Postavite 60m
   - Kliknite "Sačuvaj"
   - Vidite success message

2. **Dashboard:**
   - Navigirajte na Novembar 2025
   - Vidite horizontalnu liniju na 60m
   - Label "Cilj: 60m"

3. **Različiti Korisnici:**
   - Izaberite Hamo → Vidite cilj 60m
   - Izaberite Suljo → Vidite cilj 60m
   - Izaberite Mujo → Vidite cilj 60m

## 💡 Best Practices

### Za Administratore

1. **Podesite unaprijed** - Postavite ciljeve za buduće mjesece
2. **Budite konzistentni** - Ne mijenjajte cilj usred mjeseca
3. **Komunikujte** - Obavijestite korisnike o mjesečnim ciljevima

### Za Developere

1. **Default 30m** - Uvijek postoji fallback
2. **Cache aware** - useEffect re-fetches kada se mjesec mijenja
3. **Upsert pattern** - Sigurno ažuriranje bez dupliciranja

## 🚀 Deployment

Sve promjene su spremne za deployment:

1. **Database:** Nova tabela će se kreirati automatski
2. **Backend:** API endpoints dodani
3. **Frontend:** Components ažurirani
4. **Build:** Docker rebuild potreban

```bash
docker-compose down
docker-compose build
docker-compose up -d
```

---

**Mjesečni globalni ciljevi omogućavaju fer poređenje i fleksibilno planiranje! 📅✅**
