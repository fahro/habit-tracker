#!/bin/bash

echo "🚀 Study Tracker - Docker Setup"
echo "================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker nije instaliran!"
    echo "Molimo instalirajte Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker daemon nije pokrenut!"
    echo "Molimo pokrenite Docker Desktop ili Docker service"
    exit 1
fi

echo "✅ Docker je instaliran i pokrenut"
echo ""

# Check if Docker Compose is available
if ! docker-compose version &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose nije instaliran!"
    exit 1
fi

echo "✅ Docker Compose je dostupan"
echo ""

# Build the image
echo "🔨 Building Docker image..."
docker-compose build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo ""
echo "✅ Build uspješan!"
echo ""

# Start the container
echo "🚀 Pokrećem aplikaciju..."
docker-compose up -d

if [ $? -ne 0 ]; then
    echo "❌ Pokretanje nije uspjelo!"
    exit 1
fi

echo ""
echo "✅ Aplikacija je pokrenuta!"
echo ""
echo "================================================"
echo "🌐 Aplikacija je dostupna na:"
echo "   http://localhost:3001"
echo ""
echo "📊 Provjerite status:"
echo "   docker-compose ps"
echo ""
echo "📝 Pogledajte logove:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Zaustavite aplikaciju:"
echo "   docker-compose down"
echo "================================================"
echo ""

# Wait a bit and check health
echo "⏳ Čekam da aplikacija bude spremna..."
sleep 5

# Check if container is running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Kontejner radi!"
    echo ""
    echo "🎉 Sve je spremno! Otvorite http://localhost:3001 u browseru"
else
    echo "⚠️  Kontejner možda nije pokrenut. Provjerite sa: docker-compose logs"
fi
