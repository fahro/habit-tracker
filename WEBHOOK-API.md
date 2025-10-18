# 📡 Webhook API Dokumentacija

## Endpoint

```
POST /api/webhook/message
```

## 🆕 Format 1: Author + Content (Preporučeno)

### Request

```json
{
  "author": "Selim",
  "content": "Game 1 Chess Tactics\n30m\nGame 2 Opening Theory\n25m"
}
```

### Parametri

| Parametar | Tip | Obavezno | Opis |
|-----------|-----|----------|------|
| `author` | string | ✅ DA | Korisničko ime (auto-create ako ne postoji) |
| `content` | string | ✅ DA | Parovi: naziv lekcije + trajanje |

### Response (Success)

```json
{
  "success": true,
  "message": "✅ Selim: Zabilježeno 2 lekcija!",
  "sessions": [
    {
      "id": 1,
      "lessonName": "Game 1 Chess Tactics",
      "duration": 1800
    },
    {
      "id": 2,
      "lessonName": "Game 2 Opening Theory",
      "duration": 1500
    }
  ],
  "user": "Selim",
  "count": 2
}
```

### Response (Error - Missing Author)

```json
{
  "error": "Author je obavezan parametar"
}
```

### Primjeri

#### Primjer 1: Jedna sesija

```bash
curl -X POST http://localhost:3001/api/webhook/message \
  -H "Content-Type: application/json" \
  -d '{
    "author": "Fahro",
    "content": "Game 1 Sicilian Defense\n45m"
  }'
```

#### Primjer 2: Više sesija

```bash
curl -X POST http://localhost:3001/api/webhook/message \
  -H "Content-Type: application/json" \
  -d '{
    "author": "Marko",
    "content": "Game 1 Tactics\n20m\nGame 2 Endgame\n30m\nGame 3 Opening\n15m"
  }'
```

#### Primjer 3: Različiti formati trajanja

```bash
curl -X POST http://localhost:3001/api/webhook/message \
  -H "Content-Type: application/json" \
  -d '{
    "author": "Ana",
    "content": "Lesson 1\n1h 30m\nLesson 2\n45m 30s\nLesson 3\n2h"
  }'
```

---

## 📜 Format 2: Message (Backward Compatible)

### Request

```json
{
  "message": "Selim:\nGame 1 Chess Tactics\n30m\nGame 2 Opening Theory\n25m"
}
```

### Parametri

| Parametar | Tip | Obavezno | Opis |
|-----------|-----|----------|------|
| `message` | string | ✅ DA | Format: `Ime:\nLekcija\nTrajanje` ili samo `Lekcija\nTrajanje` |

### Format Poruke

#### Sa imenom:

```
Ime:
Lekcija 1
Trajanje 1
Lekcija 2
Trajanje 2
```

#### Bez imena (koristi prvog korisnika):

```
Lekcija 1
Trajanje 1
Lekcija 2
Trajanje 2
```

### Primjer

```bash
curl -X POST http://localhost:3001/api/webhook/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Fahro:\nGame 1 Test\n30m\nGame 2 Test\n25m"
  }'
```

---

## ⏱️ Podržani Formati Trajanja

| Format | Primjer | Sekunde |
|--------|---------|---------|
| `Xh Ym Zs` | `1h 30m 45s` | 5445 |
| `Xh Ym` | `1h 30m` | 5400 |
| `Ym Zs` | `45m 30s` | 2730 |
| `Xh` | `2h` | 7200 |
| `Ym` | `45m` | 2700 |
| `Zs` | `90s` | 90 |

**Napomena:** Razmaci su opcioni (`1h30m` = `1h 30m`)

---

## 🔄 Auto-Create Korisnika

Ako korisnik ne postoji, automatski će biti kreiran sa:
- **Name:** Iz `author` ili `message`
- **Display Name:** Isto kao name
- **Daily Goal:** 30 minuta (default)

---

## 🧪 Testiranje

### Test 1: Novi format

```bash
curl -X POST http://localhost:3001/api/webhook/message \
  -H "Content-Type: application/json" \
  -d '{
    "author": "TestUser",
    "content": "Test Lesson\n15m"
  }'
```

### Test 2: Stari format

```bash
curl -X POST http://localhost:3001/api/webhook/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "TestUser:\nTest Lesson\n15m"
  }'
```

### Test 3: Bez imena (koristi prvog korisnika)

```bash
curl -X POST http://localhost:3001/api/webhook/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Test Lesson\n15m"
  }'
```

---

## 🚀 Production URL

**Railway:**
```
POST https://atomic-habits-production-ecee.up.railway.app/api/webhook/message
```

**Test:**
```bash
curl -X POST https://atomic-habits-production-ecee.up.railway.app/api/webhook/message \
  -H "Content-Type: application/json" \
  -d '{
    "author": "YourName",
    "content": "Game 1\n30m"
  }'
```

---

## 🔐 Sigurnost (Future Enhancement)

**Preporuke za production:**

1. **API Key** - Dodati header authentication
2. **Rate Limiting** - Limitirati broj zahtjeva
3. **IP Whitelist** - Dozvoliti samo Viber/WhatsApp servere
4. **Webhook Signature** - Verifikacija Viber/WhatsApp potpisa

---

## ❌ Error Responses

### 400 - Bad Request

```json
{
  "error": "Author je obavezan parametar"
}
```

### 500 - Server Error

```json
{
  "error": "Error message details"
}
```

---

## 💡 Best Practices

1. **Koristite novi format** - Jednostavniji za parsiranje
2. **Validacija author-a** - Uvijek šaljite author
3. **Jasni nazivi lekcija** - Lakše prepoznavanje u statistikama
4. **Tačni formati trajanja** - Koristite `Xm` format za minute

---

**Happy Webhooking! 📡✅**
