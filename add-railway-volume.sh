#!/bin/bash

# Add Railway Volume for Database Persistence
# This ensures the database is not deleted on redeploys

set -e

echo "🔧 Adding Railway Volume for Database Persistence..."
echo ""

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI nije instaliran!"
    echo ""
    echo "Instalirajte ga sa:"
    echo "  brew install railway"
    echo ""
    echo "Ili dodajte volume ručno:"
    echo "  1. Otvorite: https://railway.app"
    echo "  2. Izaberite projekt: atomic-habits"
    echo "  3. Settings → Volumes → Add Volume"
    echo "  4. Mount Path: /app/data"
    echo "  5. Size: 1GB"
    exit 1
fi

echo "✅ Railway CLI pronađen"
echo ""

# Check if logged in
echo "Provjera prijave..."
railway whoami &> /dev/null || {
    echo "❌ Niste prijavljeni!"
    echo "Prijavite se sa: railway login"
    exit 1
}

echo "✅ Prijavljeni u Railway"
echo ""

# Link to project if not already linked
if [ ! -f ".railway" ]; then
    echo "📎 Povezivanje sa projektom..."
    railway link
    echo ""
fi

# Add volume
echo "💾 Dodavanje volume-a za /app/data..."
railway volume add data --mount-path /app/data

echo ""
echo "════════════════════════════════════════"
echo "✅ Volume uspješno dodat!"
echo "════════════════════════════════════════"
echo ""
echo "📋 Detalji:"
echo "  Mount Path: /app/data"
echo "  Database file: /app/data/study-tracker.db"
echo ""
echo "⚠️  Važno:"
echo "  1. Database će sada biti perzistentan"
echo "  2. Neće se brisati pri redeploy-u"
echo "  3. Podaci su sigurni"
echo ""
echo "🔄 Restart aplikacije..."
railway restart
echo ""
echo "✅ Gotovo! Database je sada perzistentan."
