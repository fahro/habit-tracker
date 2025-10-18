#!/bin/bash

# Demo Users Seed Script
# Creates 3 users with different activity patterns

API_URL="http://localhost:3001"

echo "🌱 Seeding Demo Users..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# 1. Create Hamo - Good user (no penalties)
echo -e "${BLUE}Creating Hamo (dobri učenik - bez penala)${NC}"
HAMO_RESPONSE=$(curl -s -X POST $API_URL/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hamo",
    "displayName": "Hamo Dobri",
    "dailyGoalMinutes": 30
  }')
HAMO_ID=$(echo $HAMO_RESPONSE | jq -r '.id')
echo "✅ Hamo kreiran (ID: $HAMO_ID)"
echo ""

# Update Hamo's created_at to 3 months ago
sqlite3 data/study-tracker.db "UPDATE users SET created_at = datetime('now', '-90 days') WHERE id = $HAMO_ID"

# Add sessions for Hamo - consistent, almost every day
echo "Adding Hamo's sessions (konzistentan)..."

# September sessions (30 days, misses only 2-3 days but not consecutive)
for day in {60..31}; do
  # Skip day 45 and 50 (single misses, not consecutive)
  if [ $day -eq 45 ] || [ $day -eq 50 ]; then
    continue
  fi
  
  DATE=$(date -v-${day}d +%Y-%m-%d)
  DURATION=$((25 + RANDOM % 30))  # 25-55 minutes
  
  sqlite3 data/study-tracker.db "INSERT INTO sessions (user_id, lesson_name, duration_seconds, date) VALUES ($HAMO_ID, 'Lekcija Dan -$day', $((DURATION * 60)), '$DATE')"
done

# October sessions (18 days, all present)
for day in {17..0}; do
  DATE=$(date -v-${day}d +%Y-%m-%d)
  DURATION=$((30 + RANDOM % 25))  # 30-55 minutes
  
  sqlite3 data/study-tracker.db "INSERT INTO sessions (user_id, lesson_name, duration_seconds, date) VALUES ($HAMO_ID, 'Lekcija Dan -$day', $((DURATION * 60)), '$DATE')"
done

echo -e "${GREEN}✅ Hamo sessions dodane (očekivani penali: 0)${NC}"
echo ""

# 2. Create Suljo - Decent user (1 penalty)
echo -e "${BLUE}Creating Suljo (pristojan učenik - 1 penal)${NC}"
SULJO_RESPONSE=$(curl -s -X POST $API_URL/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Suljo",
    "displayName": "Suljo Solidni",
    "dailyGoalMinutes": 30
  }')
SULJO_ID=$(echo $SULJO_RESPONSE | jq -r '.id')
echo "✅ Suljo kreiran (ID: $SULJO_ID)"
echo ""

sqlite3 data/study-tracker.db "UPDATE users SET created_at = datetime('now', '-90 days') WHERE id = $SULJO_ID"

echo "Adding Suljo's sessions (većinom dobar, ali ima 1 grupu propusta)..."

# September - good mostly, but 2 consecutive misses around day 40-41 (1 penalty)
for day in {60..31}; do
  # Skip days 40 and 41 for consecutive misses (1 penalty)
  if [ $day -eq 40 ] || [ $day -eq 41 ]; then
    continue
  fi
  
  # Skip day 50 (single miss, no penalty)
  if [ $day -eq 50 ]; then
    continue
  fi
  
  DATE=$(date -v-${day}d +%Y-%m-%d)
  DURATION=$((20 + RANDOM % 35))  # 20-55 minutes
  
  sqlite3 data/study-tracker.db "INSERT INTO sessions (user_id, lesson_name, duration_seconds, date) VALUES ($SULJO_ID, 'Lekcija Dan -$day', $((DURATION * 60)), '$DATE')"
done

# October - all good
for day in {17..0}; do
  DATE=$(date -v-${day}d +%Y-%m-%d)
  DURATION=$((25 + RANDOM % 30))
  
  sqlite3 data/study-tracker.db "INSERT INTO sessions (user_id, lesson_name, duration_seconds, date) VALUES ($SULJO_ID, 'Lekcija Dan -$day', $((DURATION * 60)), '$DATE')"
done

echo -e "${GREEN}✅ Suljo sessions dodane (očekivani penali: 1)${NC}"
echo ""

# 3. Create Mujo - Struggling user (5-6 penalties)
echo -e "${BLUE}Creating Mujo (ima problema - 5-6 penala)${NC}"
MUJO_RESPONSE=$(curl -s -X POST $API_URL/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mujo",
    "displayName": "Mujo Lenština",
    "dailyGoalMinutes": 30
  }')
MUJO_ID=$(echo $MUJO_RESPONSE | jq -r '.id')
echo "✅ Mujo kreiran (ID: $MUJO_ID)"
echo ""

sqlite3 data/study-tracker.db "UPDATE users SET created_at = datetime('now', '-90 days') WHERE id = $MUJO_ID"

echo "Adding Mujo's sessions (često propušta, više penala)..."

# September - many gaps
# Working days: 60-58 (3 days), miss 57-54 (4 days, 3 penalties)
# Working days: 53-52 (2 days), miss 51-49 (3 days, 2 penalties)
# Working days: 48-47 (2 days), miss 46-45 (2 days, 1 penalty)
# Working days: 44-43 (2 days), miss 42-41 (2 days, 1 penalty)
# Working days: 40-31 (10 days)

# Work 60-58
for day in {60..58}; do
  DATE=$(date -v-${day}d +%Y-%m-%d)
  DURATION=$((30 + RANDOM % 20))
  sqlite3 data/study-tracker.db "INSERT INTO sessions (user_id, lesson_name, duration_seconds, date) VALUES ($MUJO_ID, 'Lekcija Dan -$day', $((DURATION * 60)), '$DATE')"
done

# Miss 57-54 (4 consecutive = 3 penalties)

# Work 53-52
for day in {53..52}; do
  DATE=$(date -v-${day}d +%Y-%m-%d)
  DURATION=$((30 + RANDOM % 20))
  sqlite3 data/study-tracker.db "INSERT INTO sessions (user_id, lesson_name, duration_seconds, date) VALUES ($MUJO_ID, 'Lekcija Dan -$day', $((DURATION * 60)), '$DATE')"
done

# Miss 51-49 (3 consecutive = 2 penalties)

# Work 48-47
for day in {48..47}; do
  DATE=$(date -v-${day}d +%Y-%m-%d)
  DURATION=$((30 + RANDOM % 20))
  sqlite3 data/study-tracker.db "INSERT INTO sessions (user_id, lesson_name, duration_seconds, date) VALUES ($MUJO_ID, 'Lekcija Dan -$day', $((DURATION * 60)), '$DATE')"
done

# Miss 46-45 (2 consecutive = 1 penalty) - TOTAL SO FAR: 6 penalties

# Work 44-31
for day in {44..31}; do
  DATE=$(date -v-${day}d +%Y-%m-%d)
  DURATION=$((30 + RANDOM % 20))
  sqlite3 data/study-tracker.db "INSERT INTO sessions (user_id, lesson_name, duration_seconds, date) VALUES ($MUJO_ID, 'Lekcija Dan -$day', $((DURATION * 60)), '$DATE')"
done

# October - better, only 1 small gap
# Work 17-10
for day in {17..10}; do
  DATE=$(date -v-${day}d +%Y-%m-%d)
  DURATION=$((25 + RANDOM % 25))
  sqlite3 data/study-tracker.db "INSERT INTO sessions (user_id, lesson_name, duration_seconds, date) VALUES ($MUJO_ID, 'Lekcija Dan -$day', $((DURATION * 60)), '$DATE')"
done

# Miss 9-8 (2 consecutive = 1 penalty) - Would be 7th, but we want 5-6

# Work 7-0
for day in {7..0}; do
  DATE=$(date -v-${day}d +%Y-%m-%d)
  DURATION=$((30 + RANDOM % 20))
  sqlite3 data/study-tracker.db "INSERT INTO sessions (user_id, lesson_name, duration_seconds, date) VALUES ($MUJO_ID, 'Lekcija Dan -$day', $((DURATION * 60)), '$DATE')"
done

echo -e "${GREEN}✅ Mujo sessions dodane (očekivani penali: 6)${NC}"
echo ""

echo -e "${YELLOW}=====================================${NC}"
echo -e "${GREEN}✅ Seed Completed!${NC}"
echo -e "${YELLOW}=====================================${NC}"
echo ""
echo "Demo korisnici kreirani:"
echo "1. 👍 Hamo Dobri - Dobar učenik, bez penala"
echo "2. 😐 Suljo Solidni - Solidan učenik, 1 penal"  
echo "3. 😓 Mujo Lenština - Ima problema, 6 penala"
echo ""
echo "Otvorite http://localhost:3001 i testirajte!"
echo ""
echo "Test komande:"
echo "  curl http://localhost:3001/api/users | jq"
echo "  curl 'http://localhost:3001/api/stats/overall?userId=$HAMO_ID' | jq"
echo "  curl 'http://localhost:3001/api/stats/overall?userId=$SULJO_ID' | jq"
echo "  curl 'http://localhost:3001/api/stats/overall?userId=$MUJO_ID' | jq"
