# ⚠️ Penal Logika - Dokumentacija

## 📋 Pravilo

**Penal poen se dobija kada korisnik ima 2 ili više uzastopnih dana bez postizanja dnevnog cilja.**

## 🔢 Kako Se Računa

### Uzastopni Propusti

```javascript
let consecutiveMisses = 0;

for (let day of allDays) {
  if (!day.metGoal) {
    consecutiveMisses++;
    
    if (consecutiveMisses >= 2) {
      penalties++;
      day.penalty = true;
    }
  } else {
    consecutiveMisses = 0;  // Reset na 0 kada postigne cilj
  }
}
```

### Primjeri

#### Primjer 1: 2 Uzastopna Propusta
```
Dan 1: ✅ Cilj postignut (30m) → 0 penala
Dan 2: ❌ Propušten (0m) → consecutiveMisses = 1, 0 penala
Dan 3: ❌ Propušten (0m) → consecutiveMisses = 2, 1 penal ⚠️
Dan 4: ✅ Cilj postignut (45m) → Reset, 0 penala

Ukupno penala: 1
```

#### Primjer 2: 5 Uzastopnih Propusta
```
Dan 1: ✅ Cilj postignut → 0 penala
Dan 2: ❌ Propušten → consecutiveMisses = 1
Dan 3: ❌ Propušten → consecutiveMisses = 2, 1 penal ⚠️
Dan 4: ❌ Propušten → consecutiveMisses = 3, 1 penal ⚠️
Dan 5: ❌ Propušten → consecutiveMisses = 4, 1 penal ⚠️
Dan 6: ❌ Propušten → consecutiveMisses = 5, 1 penal ⚠️
Dan 7: ✅ Cilj postignut → Reset

Ukupno penala: 4
```

**Napomena:** Penal se dobija za **svaki dan** nakon što consecutive misses pređe 2, ne samo jednom po grupi.

#### Primjer 3: Djelimičan Rad (Ispod Cilja)
```
Cilj: 30 minuta

Dan 1: 25m → Djelimično, ali ❌ nije postignut cilj
Dan 2: 20m → Djelimično, ali ❌ nije postignut cilj
Dan 3: 15m → Consecutivemisses = 2, 1 penal ⚠️

Ukupno penala: 1
```

**Napomena:** Bilo kakav rad ispod cilja = ne postignuto = broji se kao miss.

## 📅 Evidencija od Datuma Kreiranja

### Nova Logika (v2.3.0)

**Evidencija kreće od datuma kada je korisnik kreirao račun.**

```javascript
// Don't go before user creation date
const userCreatedDate = user.created_at ? new Date(user.created_at) : startDate;
const effectiveStartDate = startDate > userCreatedDate ? startDate : userCreatedDate;
```

### Primjer

**Korisnik kreiran:** 18. oktobar 2025

**Dashboard prikazuje:**
```
Oktobar 2025
⚠️ 0 penala ovaj mjesec

✅ 18. oktobar - 1h 30m [Danas]
(nema dana prije 18. oktobra)
```

**NE prikazuje:**
```
❌ 17. oktobar - 0m [Penal]  ← NE (prije kreiranja!)
❌ 16. oktobar - 0m [Penal]  ← NE (prije kreiranja!)
```

### Zašto?

**Prije:**
- Korisnik kreiran 18. oktobra
- Dashboard prikazivao dane 1-17. oktobra kao propuste
- Dobijao 16 penala odmah po kreiranju računa ❌

**Sada:**
- Korisnik kreiran 18. oktobra
- Dashboard prikazuje samo 18. oktobar pa nadalje
- Nema penala za dane prije kreiranja ✅

## 🎯 Mjesečni Pregled

### Brojanje Penala Po Mjesecu

```javascript
const monthlyPenalties = monthlyStats.filter(day => day.penalty).length
```

**Prikazuje:**
```
⚠️ 5 penala ovaj mjesec
```

### Filter Po Datumu Kreiranja

Frontend prikazuje poruku:

```javascript
{userCreatedDate > new Date(selectedYear, selectedMonth, 1) && (
  <p>Korisnik kreiran: {userCreatedDate.toLocaleDateString()}</p>
)}
```

**Primjer:**
```
Nema aktivnosti za Septembar 2025
Korisnik kreiran: 18. oktobar 2025
```

## 📊 Database Schema

### Users Table

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT UNIQUE,
  display_name TEXT,
  daily_goal_minutes INTEGER DEFAULT 30,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

**created_at** - Datum i vrijeme kreiranja korisnika

## 🔧 API Response

### Daily Stats

```json
{
  "stats": [
    {
      "date": "2025-10-18",
      "sessionCount": 2,
      "totalSeconds": 1800,
      "totalMinutes": 30,
      "metGoal": true,
      "penalty": false,
      "consecutiveMisses": 0
    },
    {
      "date": "2025-10-17",
      "sessionCount": 0,
      "totalSeconds": 0,
      "totalMinutes": 0,
      "metGoal": false,
      "penalty": false,
      "consecutiveMisses": 1
    }
  ],
  "totalPenalties": 0
}
```

## 🎨 UI Prikaz

### Penal Badge

```jsx
{day.penalty && (
  <div className="text-destructive bg-destructive/10 px-3 py-1 rounded-full">
    <AlertCircle />
    <span>Penal</span>
  </div>
)}
```

### Uzastopni Propusti

```jsx
{day.consecutiveMisses > 0 && !day.metGoal && (
  <span>
    {day.consecutiveMisses} {day.consecutiveMisses === 1 ? 'dan' : 'dana'} propust
  </span>
)}
```

**Primjer:**
```
❌ sreda, 16. oktobar         [Penal]
    0 sesija · 0s              3 dana propust
```

## ⚖️ Reset Logike

### Kada Se Resetuje Consecutive Misses?

```javascript
if (day.metGoal) {
  consecutiveMisses = 0;  // ✅ Reset
}
```

**Resetuje se:**
- ✅ Kada korisnik postigne dnevni cilj
- ✅ Čak i 1 minut iznad cilja je dovoljno

**Ne resetuje se:**
- ❌ Djelimičan rad ispod cilja
- ❌ 0 minuta rada

### Primjer Reset-a

```
Dan 1: 45m ✅ → consecutiveMisses = 0
Dan 2: 0m  ❌ → consecutiveMisses = 1
Dan 3: 0m  ❌ → consecutiveMisses = 2, Penal ⚠️
Dan 4: 31m ✅ → consecutiveMisses = 0 (RESET!)
Dan 5: 0m  ❌ → consecutiveMisses = 1 (počinje ispočetka)
Dan 6: 0m  ❌ → consecutiveMisses = 2, Penal ⚠️
```

## 📈 Statistike

### Overall Stats Card

```jsx
<StatCard
  icon={AlertCircle}
  title="Kazneni Bodovi"
  value={stats.totalPenalties || 0}
  subtitle="2+ uzastopna dana propusta"
  color="destructive"
/>
```

### Monthly Penalties

```jsx
<div>
  {monthNames[selectedMonth]} {selectedYear}
  {monthlyPenalties > 0 && `⚠️ ${monthlyPenalties} penala ovaj mjesec`}
</div>
```

## 🧪 Test Scenariji

### Test 1: Prvi Dan Propusta
```
Input: Korisnik propušta prvi dan
Expected: 
  - consecutiveMisses = 1
  - penalty = false
  - Nema penal badge-a
```

### Test 2: Drugi Uzastopni Dan
```
Input: Korisnik propušta drugi uzastopni dan
Expected:
  - consecutiveMisses = 2
  - penalty = true
  - Prikazuje "Penal" badge
  - totalPenalties += 1
```

### Test 3: Reset Nakon Cilja
```
Input: Korisnik postigne cilj nakon 3 propusta
Expected:
  - consecutiveMisses = 0
  - Sljedeći propust počinje od 1
```

### Test 4: Novi Korisnik
```
Input: Korisnik kreiran danas
Expected:
  - Nema penala za prethodne dane
  - Prikazuje samo današnji dan
```

## 💡 Best Practices

### Za Korisnike

1. **Postignite cilj svaki dan** - Izbjegnite penale
2. **Makar minimum** - Čak i 1 minut više od cilja resetuje niz
3. **Pratite consecutive misses** - Vidite koliko vam ostaje do penala

### Za Developere

1. **Uvijek filtrirajte po created_at** - Ne računajte dane prije
2. **Consecutive misses je per-user** - Svaki korisnik ima svoj brojač
3. **Reset je važan** - Mora biti tačan za fer sistem

---

**Penal sistem dizajniran da motiviše konzistentnost, ali ne kažnjava prije kreiranja računa! ⚖️✅**
