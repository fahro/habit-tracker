# 🐳 Docker Guide - Study Tracker

Kompletni vodič za pokretanje Study Tracker aplikacije sa Docker-om.

## Brzo Pokretanje

```bash
# 1. Build Docker image
docker-compose build

# 2. Pokreni aplikaciju
docker-compose up -d

# 3. Provjeri da li radi
docker-compose ps
docker-compose logs -f

# 4. Otvori aplikaciju
# http://localhost:3001
```

## Komande

### Osnovne Komande

```bash
# Build image
docker-compose build

# Start u detached modu (background)
docker-compose up -d

# Start sa logovima
docker-compose up

# Zaustavi kontejnere
docker-compose down

# Restart
docker-compose restart

# Vidi logove
docker-compose logs -f

# Vidi logove za određeni servis
docker-compose logs -f app
```

### Development

```bash
# Pokreni u development modu sa hot reload
docker-compose --profile dev up app-dev

# Ili koristi make
make dev
```

### Maintenance

```bash
# Otvori shell u kontejneru
docker-compose exec app sh

# Provjeri status
docker-compose ps

# Vidi resource usage
docker stats study-tracker

# Ukloni sve (kontejnere, volume, images)
docker-compose down -v --rmi all
```

## Makefile Komande

Ako imate `make` instaliran:

```bash
make help       # Prikaži sve dostupne komande
make build      # Build image
make up         # Start production
make down       # Stop kontejnere
make logs       # Vidi logove
make shell      # Otvori shell
make dev        # Start development mod
make clean      # Očisti sve Docker resurse
make restart    # Restart kontejnere
```

## Struktura

```
atomic-habits/
├── Dockerfile              # Production build
├── Dockerfile.dev          # Development build
├── docker-compose.yml      # Orchestracija servisa
├── .dockerignore          # Fajlovi za ignorisanje
├── data/                  # SQLite baza (volume mount)
├── server/                # Backend kod
├── src/                   # Frontend kod
└── dist/                  # Built frontend (production)
```

## Volumes (Persistent Data)

Baza podataka se čuva u `./data` folderu:

```bash
# Lokacija na host sistemu
./data/study-tracker.db

# Lokacija u kontejneru
/app/data/study-tracker.db
```

**Backup baze:**

```bash
# Kopiraj bazu iz kontejnera
docker cp study-tracker:/app/data/study-tracker.db ./backup.db

# Restore bazu
docker cp ./backup.db study-tracker:/app/data/study-tracker.db
docker-compose restart
```

## Environment Variables

Možete postaviti environment variables u `docker-compose.yml`:

```yaml
environment:
  - NODE_ENV=production
  - PORT=3001
  - DB_PATH=/app/data/study-tracker.db  # Custom DB path
```

## Port Mapping

Default port mapping:

```yaml
ports:
  - "3001:3001"  # host:container
```

Ako želite koristiti drugi port na host sistemu:

```yaml
ports:
  - "8080:3001"  # Aplikacija dostupna na http://localhost:8080
```

## Health Checks

Kontejner ima built-in health check:

```bash
# Provjeri health
docker inspect --format='{{.State.Health.Status}}' study-tracker

# Detaljni health status
docker inspect study-tracker | grep -A 10 Health
```

## Troubleshooting

### Kontejner se ne pokreće

```bash
# Vidi detaljne logove
docker-compose logs

# Provjeri build errors
docker-compose build --no-cache
```

### Baza se ne čuva

```bash
# Provjeri volumes
docker-compose ps -v

# Provjeri da li folder postoji
ls -la ./data
```

### Port već u upotrebi

```bash
# Provjeri koji proces koristi port 3001
lsof -i :3001

# Ili promijeni port u docker-compose.yml
ports:
  - "3002:3001"
```

### Cannot connect to Docker daemon

```bash
# Start Docker service
# macOS: Pokreni Docker Desktop
# Linux:
sudo systemctl start docker
```

## Production Best Practices

### 1. Use Non-Root User (Opciono)

Dodaj u Dockerfile:

```dockerfile
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs
```

### 2. Multi-Stage Build

Već implementirano u Dockerfile:
- Builder stage: compiles i builds
- Production stage: samo runtime dependencies

### 3. Health Checks

Već implementirano - aplikacija se automatski restartuje ako health check faila.

### 4. Logging

```bash
# Logovi se automatski skupljaju
docker-compose logs -f

# Limit broj linija
docker-compose logs --tail=100

# Export logs
docker-compose logs > app.log
```

### 5. Resource Limits

Dodaj u docker-compose.yml:

```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 512M
    reservations:
      cpus: '0.25'
      memory: 256M
```

## Docker na Serveru

### DigitalOcean / AWS / Hetzner

```bash
# 1. SSH na server
ssh user@your-server-ip

# 2. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 3. Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 4. Clone repo
git clone <your-repo>
cd atomic-habits

# 5. Start aplikaciju
docker-compose up -d

# 6. Setup nginx reverse proxy (opciono)
# Vidi nginx konfiguraciju ispod
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL sa Let's Encrypt

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto renewal je automatski setupovan
```

## Docker Registry Deployment

### DockerHub

```bash
# 1. Login
docker login

# 2. Build i tag
docker build -t your-username/study-tracker:latest .

# 3. Push
docker push your-username/study-tracker:latest

# 4. Pull na serveru
docker pull your-username/study-tracker:latest
docker run -d -p 3001:3001 \
  -v $(pwd)/data:/app/data \
  --name study-tracker \
  your-username/study-tracker:latest
```

### GitHub Container Registry (GHCR)

```bash
# 1. Create GitHub Personal Access Token

# 2. Login
echo $GITHUB_TOKEN | docker login ghcr.io -u your-username --password-stdin

# 3. Build i tag
docker build -t ghcr.io/your-username/study-tracker:latest .

# 4. Push
docker push ghcr.io/your-username/study-tracker:latest
```

## Monitoring

### Logs

```bash
# Real-time logs
docker-compose logs -f

# Filter logs
docker-compose logs -f | grep ERROR
```

### Metrics

```bash
# CPU, Memory, Network usage
docker stats study-tracker

# Format output
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

## Backup & Restore

### Backup Everything

```bash
#!/bin/bash
# backup.sh

# Create backup directory
mkdir -p backups/$(date +%Y%m%d)

# Backup database
docker cp study-tracker:/app/data/study-tracker.db backups/$(date +%Y%m%d)/

# Backup docker-compose configuration
cp docker-compose.yml backups/$(date +%Y%m%d)/

echo "Backup completed: backups/$(date +%Y%m%d)"
```

### Restore

```bash
# Stop kontejner
docker-compose down

# Restore database
cp backups/20241017/study-tracker.db ./data/

# Start ponovo
docker-compose up -d
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Login to DockerHub
        uses: docker/login-action@v1
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: Build and push
        uses: docker/build-push-action@v2
        with:
          push: true
          tags: your-username/study-tracker:latest
```

---

Za dodatna pitanja, pogledaj glavni README.md ili otvori issue.
