# 👥 Demo Korisnici - Dokumentacija

## 🎯 Pregled

Kreirano 3 demo korisnika sa različitim obrascima aktivnosti za testiranje i prezentaciju sistema:

1. **Hamo Dobri** - Dobar učenik (4 penala)
2. **Suljo Solidni** - Solidan učenik (8 penala)
3. **Mujo Lenština** - Ima problema (6 penala)

## 📊 Statistike Demo Korisnika

### 👍 Hamo Dobri

**Profil:**
- Dnevni cilj: 30 minuta
- Period aktivnosti: ~61 dan
- Ukupno sesija: 58
- Ukupno vrijeme: ~38 sati

**Karakteristike:**
- Vrlo konzistentan
- Rijetko propušta dane
- Većinom postiže cilj
- **Penali: 4** (nekoliko manjih grupa propusta)

### 😐 Suljo Solidni

**Profil:**
- Dnevni cilj: 30 minuta
- Period aktivnosti: ~61 dan
- Ukupno sesija: 57
- Ukupno vrijeme: ~35 sati

**Karakteristike:**
- Prilično dobar
- Povremeno propušta
- Ima nekoliko uzastopnih propusta
- **Penali: 8** (srednji nivo problema)

### 😓 Mujo Lenština

**Profil:**
- Dnevni cilj: 30 minuta
- Period aktivnosti: ~61 dan
- Ukupno sesija: 52
- Ukupno vrijeme: ~33 sata

**Karakteristike:**
- Ima značajnih problema sa konzistencijom
- Više grupa uzastopnih propusta
- **Penali: 6** (dizajnirano sa specifičnim gap-ovima)

**Pattern propusta:**
- Dani 57-54: 4 uzastopna propusta (3 penala)
- Dani 51-49: 3 uzastopna propusta (2 penala)
- Dani 46-45: 2 uzastopna propusta (1 penal)

## 🛠️ Kako Kreirati Demo Korisnike

### Brza Metoda (Preporučeno)

```bash
./seed-demo-users-v2.sh
./fix-demo-dates.sh
```

**Šta radi:**
1. Kreira 3 korisnike preko API-ja
2. Dodaje ~50-60 sesija za svakog
3. Backdatuje sesije u prošlost (60 dana)
4. Postavlja creation date na dan prve sesije

### Manualna Provjera

```bash
# Provjeri korisnike
curl http://localhost:3001/api/users | jq

# Provjeri statistike
curl 'http://localhost:3001/api/stats/overall?userId=19' | jq  # Hamo
curl 'http://localhost:3001/api/stats/overall?userId=20' | jq  # Suljo
curl 'http://localhost:3001/api/stats/overall?userId=21' | jq  # Mujo

# Provjeri penale
curl 'http://localhost:3001/api/stats/daily?userId=19&days=90' | jq '.totalPenalties'
curl 'http://localhost:3001/api/stats/daily?userId=20&days=90' | jq '.totalPenalties'
curl 'http://localhost:3001/api/stats/daily?userId=21&days=90' | jq '.totalPenalties'
```

## 🎨 Kako Testirati u UI

### 1. Otvorite Aplikaciju
```
http://localhost:3001
```

### 2. Izaberite Korisnika

U gornjem desnom uglu kliknite user selector i izaberite:
- **Hamo** - Vidite dobar streak, malo penala
- **Suljo** - Vidite srednji nivo, više penala
- **Mujo** - Vidite probleme, 6 penala

### 3. Dashboard

Svaki korisnik će imati:
- ✅ Trenutni niz
- 📊 Grafikon aktivnosti
- ⚠️ Kazneni bodovi
- 📅 Mjesečni pregled sa penalima

### 4. Mjesečni Pregled

Navigirajte između mjeseci (Avgust, Septembar, Oktobar):
- **Avgust:** Početak aktivnosti
- **Septembar:** Glavni mjesec sa većinom aktivnosti
- **Oktobar:** Trenutni mjesec

Vidite penale označene sa **⚠️ Penal** badge-om.

## 📋 Use Cases

### Prezentacija Funkcionalnosti

**Za investitore/klijente:**
1. Pokažite Hamo-a - Idealan scenario
2. Pokažite Suljo-a - Realan scenario  
3. Pokažite Muju - Problem scenario koji sistem detektuje

### Testing

**Razvojni tim:**
- Test mjesečnog pregleda sa stvarnim podacima
- Test penalizacije sa različitim pattern-ima
- Test user switch-a između korisnika
- Test dashboard-a sa različitim streak-ovima

### Demo za Korisnike

**Novi korisnici:**
- Vide kako izgleda popunjen dashboard
- Razumiju koncept penala
- Vide kako radi mjesečni pregled
- Motivacija kroz primjere

## 🔧 Troubleshooting

### Problem: Penali Ne Odgovaraju

**Rješenje:**
```bash
# Reset demo users
sqlite3 data/study-tracker.db "DELETE FROM sessions WHERE user_id IN (19, 20, 21)"
sqlite3 data/study-tracker.db "DELETE FROM users WHERE id IN (19, 20, 21)"

# Re-run scripts
./seed-demo-users-v2.sh
./fix-demo-dates.sh
```

### Problem: Korisnici Ne Postoje

**Rješenje:**
```bash
# Check if users exist
sqlite3 data/study-tracker.db "SELECT id, name FROM users WHERE name IN ('Hamo', 'Suljo', 'Mujo')"

# If not, run seed script
./seed-demo-users-v2.sh
```

### Problem: Datumi Su Današnji

**Rješenje:**
```bash
# Run fix script
./fix-demo-dates.sh

# Restart app
docker-compose restart app
```

## 📈 Očekivane Vrijednosti

### After Fresh Seed

| Korisnik | Sesije | Dani | Penali | Ukupno Vrijeme |
|----------|--------|------|--------|----------------|
| Hamo     | 58     | 61   | 2-4    | ~38h           |
| Suljo    | 57     | 61   | 6-8    | ~35h           |
| Mujo     | 52     | 61   | 6      | ~33h           |

**Napomena:** Tačan broj penala ovisi o randomizaciji trajanja sesija i specifičnim danima propusta.

## 🎯 Mujo Pattern (Dizajnirano za 6 Penala)

```
Dani 60-58: Radi (3 dana)
Dani 57-54: Propušta (4 dana) → 3 penala
Dani 53-52: Radi (2 dana)
Dani 51-49: Propušta (3 dana) → 2 penala
Dani 48-47: Radi (2 dana)
Dani 46-45: Propušta (2 dana) → 1 penal
Dani 44-1: Radi (44 dana)

Ukupno: 6 penala
```

## 💡 Tips

### Za Best Demo Experience

1. **Pre-seed prije demo-a** - Pokrenite skripte unaprijed
2. **Test svih korisnika** - Provjerite da sve radi
3. **Pripremite priču** - Objasni svaki use case
4. **Pokažite mjesečni pregled** - Navigacija između mjeseci
5. **Highlight penale** - Pokažite kako sistem detektuje probleme

### Za Development

1. **Keep demo users** - Ne brišite, koriste se za testing
2. **Dodajte više** - Kreirajte dodatne pattern-e ako trebate
3. **Document changes** - Ako mijenjate pattern, ažurirajte ovu dokumentaciju

---

**Demo korisnici omogućavaju realističan prikaz funkcionalnosti sistema! 👥✅**

## 🚀 Quick Start

```bash
# 1. Seed demo users
./seed-demo-users-v2.sh

# 2. Fix dates
./fix-demo-dates.sh

# 3. Open app
open http://localhost:3001

# 4. Select Hamo, Suljo, or Mujo from user selector

# 5. Explore!
```
