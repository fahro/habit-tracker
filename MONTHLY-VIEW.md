# 📅 Mjesečni Pregled - Dokumentacija

## 🎯 Nova Funkcionalnost

Mjesečni pregled omogućava:
- ✅ Prikaz svih dana za **izabrani mjesec**
- ✅ Navigacija između mjeseci (⬅️ ➡️)
- ✅ Brojanje **penala po mjesecu**
- ✅ Prikaz datuma kada je **korisnik kreiran**
- ✅ Filtriranje samo aktivnosti za taj mjesec

## 🖼️ Kako Izgleda

```
┌────────────────────────────────────────────────┐
│  📅 Mjesečni Pregled                           │
│                                                 │
│  ⬅️  Oktobar 2025  ➡️                          │
│      ⚠️ 5 penala ovaj mjesec                   │
├────────────────────────────────────────────────┤
│                                                 │
│  ✅ utorak, 1. oktobar                         │
│     2 sesija · 45m 0s                          │
│                                                 │
│  ⚠️ sreda, 2. oktobar               [Penal]   │
│     0 sesija · 0s                    2 dana    │
│                                                 │
│  ✅ četvrtak, 18. oktobar          [Danas]    │
│     3 sesije · 1h 30m                          │
│                                                 │
└────────────────────────────────────────────────┘
```

## 🔍 Komponente

### 1. **Month Selector**

```jsx
<div className="flex items-center gap-4">
  <button onClick={goToPreviousMonth}>
    <ChevronLeft />
  </button>
  
  <div>
    Oktobar 2025
    ⚠️ 5 penala ovaj mjesec
  </div>
  
  <button onClick={goToNextMonth}>
    <ChevronRight />
  </button>
</div>
```

**Dugmići:**
- **⬅️ Prethodni** - Ide na prethodni mjesec
- **➡️ Sljedeći** - Ide na sljedeći mjesec (disabled za buduće mjesece)

### 2. **Mjesečni Penali**

Automatski se računaju za izabrani mjesec:

```javascript
const monthlyPenalties = monthlyStats.filter(day => day.penalty).length
```

**Prikazuje se:**
```
⚠️ 5 penala ovaj mjesec
```

### 3. **Prikaz Korisničkog Datuma**

Ako korisnik nema aktivnosti u tom mjesecu:

```
Nema aktivnosti za Septembar 2025
Korisnik kreiran: 18. oktobar 2025
```

## 📊 Logika Filtriranja

### Filter po Mjesecu

```javascript
const monthlyStats = dailyStats.stats.filter(day => {
  const dayDate = new Date(day.date)
  return dayDate.getMonth() === selectedMonth && 
         dayDate.getFullYear() === selectedYear
}).reverse()
```

**Vraća:**
- Samo dane iz izabranog mjeseca
- Sortirane od najnovijeg ka najstarijem

### Računanje Penala

```javascript
const monthlyPenalties = monthlyStats.filter(day => day.penalty).length
```

**Broji:**
- Sve dane sa `penalty: true`
- Za trenutno izabrani mjesec

## 🗓️ Navigacija

### State Management

```javascript
const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
```

**Default:** Trenutni mjesec i godina

### Prethodni Mjesec

```javascript
const goToPreviousMonth = () => {
  if (selectedMonth === 0) {
    setSelectedMonth(11)  // Decembar
    setSelectedYear(selectedYear - 1)
  } else {
    setSelectedMonth(selectedMonth - 1)
  }
}
```

### Sljedeći Mjesec

```javascript
const goToNextMonth = () => {
  const now = new Date()
  if (selectedYear === now.getFullYear() && 
      selectedMonth === now.getMonth()) {
    return // Ne dozvoli buduće mjesece
  }
  if (selectedMonth === 11) {
    setSelectedMonth(0)  // Januar
    setSelectedYear(selectedYear + 1)
  } else {
    setSelectedMonth(selectedMonth + 1)
  }
}
```

## 📅 Mjeseci (Lokalizovano)

```javascript
const monthNames = [
  'Januar', 'Februar', 'Mart', 'April', 
  'Maj', 'Jun', 'Jul', 'Avgust', 
  'Septembar', 'Oktobar', 'Novembar', 'Decembar'
]
```

## 🎨 UI Features

### Indikatori

- ✅ **Zelena ikona** - Cilj postignut
- 🟠 **Narančasta** - Djelimično
- ⚫ **Siva** - Propušten dan
- ⚠️ **Crveni badge "Penal"** - Kazneni bod
- 🔵 **"Danas" badge** - Trenutni dan

### Hover Effects

```css
hover:bg-secondary  /* Svjetlija pozadina */
transition-colors   /* Smooth prelaz */
```

### Disabled State

```jsx
<button
  disabled={selectedYear === currentYear && selectedMonth === currentMonth}
  className="disabled:opacity-50 disabled:cursor-not-allowed"
>
```

## 📱 Responsive

```jsx
<div className="max-h-96 overflow-y-auto">
  {/* Scrollable lista dana */}
</div>
```

**Features:**
- Maximalna visina 96 (384px)
- Scrollable ako ima više dana
- Responsive na svim uređajima

## 🔢 Brojanje

### Ukupno Penala (Mjesečno)

```javascript
monthlyPenalties = 5
```

**Prikaz:**
```
⚠️ 5 penala ovaj mjesec
```

**Ako nema:**
- Ne prikazuje se poruka

### Uzastopni Propusti (Po Danu)

```javascript
{day.consecutiveMisses} dana propust
```

**Primjer:**
```
3 dana propust
```

## 💾 Persistencija

**State se resetuje na:**
- Trenutni mjesec kada se komponenta mount-uje
- Ne čuva se u local storage (namjerno)

**Za čuvanje state-a:**
```javascript
useEffect(() => {
  localStorage.setItem('selectedMonth', selectedMonth)
  localStorage.setItem('selectedYear', selectedYear)
}, [selectedMonth, selectedYear])
```

## 🧪 Test Scenariji

### Scenario 1: Trenutni Mjesec
```
Input: Oktobar 2025 (trenutni)
Output: 
- Prikazuje sve dane u Oktobru
- "Danas" badge na trenutnom danu
- Sljedeći mjesec disabled
```

### Scenario 2: Prethodni Mjesec
```
Input: Septembar 2025
Output:
- Prikazuje sve dane u Septembru
- Nema "Danas" badge
- Oba dugmeta enabled
```

### Scenario 3: Nema Aktivnosti
```
Input: Maj 2025 (prije registracije)
Output:
- "Nema aktivnosti za Maj 2025"
- "Korisnik kreiran: 18. oktobar 2025"
```

### Scenario 4: Prelazak Godine
```
Input: Decembar 2024 → Sljedeći
Output:
- selectedMonth = 0 (Januar)
- selectedYear = 2025
```

## 📊 Primjer Podataka

### MonthlyStats Structure

```javascript
[
  {
    date: "2025-10-01",
    sessionCount: 2,
    totalSeconds: 2700,
    totalMinutes: 45,
    metGoal: true,
    penalty: false,
    consecutiveMisses: 0
  },
  {
    date: "2025-10-02",
    sessionCount: 0,
    totalSeconds: 0,
    totalMinutes: 0,
    metGoal: false,
    penalty: true,
    consecutiveMisses: 2
  }
]
```

## 🎯 Korisne Informacije

### Kada Se Prikazuje Penal

```javascript
day.penalty === true
```

**Uslovi:**
- 2+ uzastopna dana bez postizanja cilja
- Backend logika

### Kada Se Prikazuje "Danas"

```javascript
day.date === new Date().toISOString().split('T')[0]
```

**Format:**
```
2025-10-18 === "2025-10-18"
```

---

**Mjesečni pregled omogućava detaljno praćenje aktivnosti i penala po mjesecima! 📅✅**
