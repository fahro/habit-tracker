# 📡 Webhook Sekcija - Preview

## Kako Izgleda na Stranici

### 🔵 Webhook URL za Integraciju

Koristite ovaj URL za automatsko slanje poruka iz Viber/WhatsApp bota:

```
http://localhost:3001/api/webhook/message
```

---

### ✅ Format 1: Author + Content (Preporučeno)

```json
{
  "author": "Ime",
  "content": "Game 1\n30m"
}
```

✅ **author** je obavezan | Korisnik se automatski kreira ako ne postoji

---

### 📜 Format 2: Message (Backward Compatible)

```json
{
  "message": "Ime:\nGame 1\n30m"
}
```

Format: `Ime:` na prvoj liniji, zatim lekcije i trajanja

---

**Primjer trajanja:** 30m, 1h 30m, 45m 30s, 2h

---

## 🎨 Stilizacija

- **Plava pozadina** - bg-blue-50
- **Code blokovi** - Bijela pozadina sa border-om
- **Ikona** - Link2 icon
- **Font** - Mono za URL, regular za ostalo
- **Razmaci** - Jasno odvojeni formati

## 📊 Informacije Prikazane

1. ✅ **URL** - Glavni webhook endpoint
2. ✅ **Format 1** - Novi format sa primjerom
3. ✅ **Format 2** - Stari format za backward compatibility
4. ✅ **Objašnjenje** - Šta je author, šta je obavezno
5. ✅ **Primjeri trajanja** - Svi podržani formati

## 💡 Prednosti Nove Sekcije

- **Jasnija** - Dva odvojena formata
- **Primjeri** - JSON format direktno prikazan
- **Obavezni parametri** - Jasno označeni
- **Kompatibilnost** - Stari format i dalje podržan
- **Dokumentovano** - Svi formati trajanja

---

**Lokacija:** Tab "Dodaj Sesiju" → Scroll do dna → Plava sekcija "Webhook URL"
