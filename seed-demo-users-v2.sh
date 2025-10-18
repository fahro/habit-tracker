#!/bin/bash

# Demo Users Seed Script v2
# Creates 3 users with different activity patterns via API

API_URL="http://localhost:3001"

echo "🌱 Seeding Demo Users via API..."
echo ""

# Function to add session
add_session() {
  local author=$1
  local days_ago=$2
  local minutes=$3
  
  local date=$(date -v-${days_ago}d +%Y-%m-%d)
  
  curl -s -X POST $API_URL/api/webhook/message \
    -H "Content-Type: application/json" \
    -d "{
      \"author\": \"$author\",
      \"content\": \"Lekcija Dan -$days_ago ${minutes}m\"
    }" > /dev/null
}

echo "👍 Creating Hamo Dobri (dobar učenik - bez penala)..."
# Create Hamo with first session
curl -s -X POST $API_URL/api/webhook/message \
  -H "Content-Type: application/json" \
  -d '{
    "author": "Hamo",
    "content": "Početna lekcija 45m"
  }' > /dev/null

# Add sessions for last 60 days (skip only 2 non-consecutive days)
for day in {59..1}; do
  # Skip day 45 and 30 (single misses, not consecutive)
  if [ $day -eq 45 ] || [ $day -eq 30 ]; then
    continue
  fi
  
  minutes=$((25 + RANDOM % 30))  # 25-55 minutes
  add_session "Hamo" $day $minutes
  
  # Small delay to avoid overwhelming API
  sleep 0.05
done

echo "✅ Hamo kreiran sa ~58 dana aktivnosti (0 penala)"
echo ""

echo "😐 Creating Suljo Solidni (solidan učenik - 1 penal)..."
# Create Suljo
curl -s -X POST $API_URL/api/webhook/message \
  -H "Content-Type: application/json" \
  -d '{
    "author": "Suljo",
    "content": "Početna lekcija 40m"
  }' > /dev/null

# Add sessions with one 2-day consecutive gap (1 penalty)
for day in {59..1}; do
  # Skip days 40-41 for consecutive misses (1 penalty)
  if [ $day -eq 40 ] || [ $day -eq 41 ]; then
    continue
  fi
  
  # Skip day 50 (single miss, no penalty)
  if [ $day -eq 50 ]; then
    continue
  fi
  
  minutes=$((20 + RANDOM % 35))
  add_session "Suljo" $day $minutes
  sleep 0.05
done

echo "✅ Suljo kreiran sa ~56 dana aktivnosti (1 penal)"
echo ""

echo "😓 Creating Mujo Lenština (ima problema - 5-6 penala)..."
# Create Mujo
curl -s -X POST $API_URL/api/webhook/message \
  -H "Content-Type: application/json" \
  -d '{
    "author": "Mujo",
    "content": "Početna lekcija 35m"
  }' > /dev/null

# Add sessions with multiple gaps creating 6 penalties
# Pattern: work 3 days, miss 4 days (3 penalties), work 2, miss 3 (2 penalties), work 2, miss 2 (1 penalty), work rest

# Work days 60-58 (3 days)
for day in {60..58}; do
  minutes=$((30 + RANDOM % 20))
  add_session "Mujo" $day $minutes
  sleep 0.05
done

# Miss days 57-54 (4 consecutive = 3 penalties)

# Work days 53-52 (2 days)
for day in {53..52}; do
  minutes=$((30 + RANDOM % 20))
  add_session "Mujo" $day $minutes
  sleep 0.05
done

# Miss days 51-49 (3 consecutive = 2 penalties)

# Work days 48-47 (2 days)
for day in {48..47}; do
  minutes=$((30 + RANDOM % 20))
  add_session "Mujo" $day $minutes
  sleep 0.05
done

# Miss days 46-45 (2 consecutive = 1 penalty)

# Work days 44-1 (rest of the days)
for day in {44..1}; do
  minutes=$((25 + RANDOM % 25))
  add_session "Mujo" $day $minutes
  sleep 0.05
done

echo "✅ Mujo kreiran sa ~50 dana aktivnosti (6 penala)"
echo ""

echo "======================================"
echo "✅ Demo Users Created!"
echo "======================================"
echo ""
echo "Korisnici:"
echo "1. 👍 Hamo - Dobar učenik (~58/60 dana, 0 penala)"
echo "2. 😐 Suljo - Solidan učenik (~56/60 dana, 1 penal)"  
echo "3. 😓 Mujo - Ima problema (~50/60 dana, 6 penala)"
echo ""
echo "Otvorite http://localhost:3001 i testirajte!"
echo ""
echo "Napomena: Pričekajte par sekundi da se baza ažurira..."
sleep 2

echo ""
echo "Test - dohvatam korisnike..."
curl -s http://localhost:3001/api/users | jq -r '.[] | select(.name == "Hamo" or .name == "Suljo" or .name == "Mujo") | "\(.id): \(.display_name)"'
