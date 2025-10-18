# Password Zaštita za Brisanje Korisnika

## Implementacija

Brisanje korisnika zahtijeva **admin šifru** za dodatnu sigurnost.

## Šifra

```
nikadporazsamolekcija
```

## Kako Funkcioniše

### Frontend (`UserManagement.jsx`)

1. **Delete Dialog**: Prikazuje se password input polje
2. **Validacija**: Dugme "Obriši Korisnika" je disabled dok se ne unese šifra
3. **API Zahtjev**: Šalje password u request body

```javascript
const response = await fetch(`/api/users/${userId}`, {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    password: deletePassword
  })
})
```

### Backend (`server/index.js`)

1. **Primanje**: Backend prima password iz request body
2. **Validacija**: Poredi sa hardcoded šifrom
3. **Odbijanje**: Vraća 403 Forbidden ako je šifra pogrešna

```javascript
const ADMIN_PASSWORD = 'nikadporazsamolekcija';
if (password !== ADMIN_PASSWORD) {
  return res.status(403).json({ error: 'Pogrešna šifra' });
}
```

## UI Komponente

### Delete Dialog Izgled

```
┌─────────────────────────────────────┐
│  🗑️  Potvrda Brisanja               │
│  Ova akcija se ne može poništiti    │
├─────────────────────────────────────┤
│                                     │
│  Da li ste sigurni da želite       │
│  obrisati korisnika Fahro?         │
│                                     │
│  ⚠️ Upozorenje: Sve sesije ovog    │
│     korisnika će biti trajno       │
│     obrisane.                      │
│                                     │
│  Šifra za potvrdu *                │
│  ┌───────────────────────────┐     │
│  │ ••••••••••••••••••       │     │
│  └───────────────────────────┘     │
│  Za sigurnost, potrebna je šifra   │
│                                     │
│  ┌───────────────┐  ┌─────────┐   │
│  │ 🗑️ Obriši     │  │ Otkaži  │   │
│  │   Korisnika   │  │         │   │
│  └───────────────┘  └─────────┘   │
└─────────────────────────────────────┘
```

## Error Poruke

### Pogrešna šifra
```
❌ Pogrešna šifra
```

### Uspješno brisanje
```
✅ Uspješno sačuvano!
```

## Sigurnosne Karakteristike

1. ✅ **Password Input**: Type="password" - prikazuje ••• umjesto teksta
2. ✅ **Disabled Button**: Ne može se kliknuti bez unosa šifre
3. ✅ **Backend Validacija**: Šifra se provjerava na serveru
4. ✅ **Clear on Cancel**: Šifra se briše kada se klikne "Otkaži"
5. ✅ **Clear on Success**: Šifra se briše nakon uspješnog brisanja

## Upotreba

### Korak 1: Klik na Delete
Kliknite na ikonu korpe za smeće pored korisnika.

### Korak 2: Unesite Šifru
U polje "Šifra za potvrdu" unesite:
```
nikadporazsamolekcija
```

### Korak 3: Potvrdite
Kliknite "Obriši Korisnika".

## Napomene

⚠️ **Važno**:
- Šifra je **case-sensitive** (razlikuje velika/mala slova)
- Sva slova moraju biti **mala**
- Bez razmaka ili specijalnih karaktera
- Korisnik se **ne može** obrisati ako je jedini u sistemu

## Buduća Poboljšanja

Moguća poboljšanja:
- Environment varijabla umjesto hardcoded šifre
- Hash šifre na backend-u
- Rate limiting za prevenciju brute force napada
- Audit log brisanja korisnika
