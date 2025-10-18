# Railway Volume Setup - Čuvanje Podataka

## Problem
Kod Railway deploya, podaci u SQLite bazi se gube nakon svakog novog deploya jer se kontejner ponovo kreira.

## Rješenje
Dodavanje **persistent volume** koji čuva podatke između deploya.

## Konfiguracija

### 1. Railway Volume u `railway.toml`

```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile.railway"

[deploy]
numReplicas = 1
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
healthcheckPath = "/api/health"
healthcheckTimeout = 100

# Persistent volume za bazu podataka
[[deploy.volumes]]
mountPath = "/app/data"
name = "database_volume"
```

### 2. Dockerfile Konfiguracija

U `Dockerfile.railway` je već konfigurisano:

```dockerfile
# Kreiranje direktorija za bazu sa odgovarajućim permisijama
RUN mkdir -p /app/data && \
    chown -R node:node /app

# Non-root user za sigurnost
USER node
```

### 3. Database Lokacija

U `server/database.js`:

```javascript
const dataDir = process.env.NODE_ENV === 'production' 
  ? path.join(__dirname, '../data')  // Production - volume mount
  : __dirname;                        // Development - lokalni folder

const dbPath = path.join(dataDir, 'study-tracker.db');
```

## Kako Volume Radi

1. **Prvi deploy**: Railway kreira volume `database_volume` i mount-uje ga na `/app/data`
2. **Baza se kreira**: SQLite kreira `study-tracker.db` u `/app/data`
3. **Svi naredni deploy-i**: Volume ostaje netaknut, baza se čuva između deploya
4. **Podaci su sigurni**: Čak i ako se kontejner restartuje ili redeploy-uje

## Provjera

Nakon deploya, možete provjeriti da li volume radi:

1. Otvorite Railway projekt
2. Idite na **Deployments** → **Volumes**
3. Trebate vidjeti `database_volume` sa veličinom > 0 KB

## Napomena

⚠️ **Važno**: Volume se NE briše automatski kada obrišete deployment. Ako trebate resetovati bazu:

1. Idite u Railway dashboard
2. **Volumes** → `database_volume`
3. Ručno obrišite volume
4. Redeploy aplikacije (kreirat će se novi prazan volume)

## Backup

Za backup baze, možete koristiti Railway CLI:

```bash
railway run cat /app/data/study-tracker.db > backup-$(date +%Y%m%d).db
```

## Environment Variables

Nisu potrebne dodatne environment varijable - volume se automatski mount-uje na osnovu `railway.toml` konfiguracije.
