#!/bin/bash

echo "🔧 Fixing demo user dates in database..."
echo ""

DB_PATH="data/study-tracker.db"

# Get user IDs
HAMO_ID=$(sqlite3 $DB_PATH "SELECT id FROM users WHERE name = 'Hamo'")
SULJO_ID=$(sqlite3 $DB_PATH "SELECT id FROM users WHERE name = 'Suljo'")
MUJO_ID=$(sqlite3 $DB_PATH "SELECT id FROM users WHERE name = 'Mujo'")

echo "User IDs:"
echo "  Hamo: $HAMO_ID"
echo "  Suljo: $SULJO_ID"
echo "  Mujo: $MUJO_ID"
echo ""

# Update created_at to 90 days ago for all demo users
echo "Setting creation dates to 90 days ago..."
sqlite3 $DB_PATH "UPDATE users SET created_at = datetime('now', '-90 days') WHERE id IN ($HAMO_ID, $SULJO_ID, $MUJO_ID)"

# Now backdate sessions for each user
echo "Backdating Hamo's sessions..."

# Get all of Hamo's session IDs
HAMO_SESSIONS=$(sqlite3 $DB_PATH "SELECT id FROM sessions WHERE user_id = $HAMO_ID ORDER BY id")

counter=0
for session_id in $HAMO_SESSIONS; do
  days_ago=$((60 - counter))
  
  # Skip days 45 and 30 (these shouldn't exist)
  if [ $days_ago -eq 45 ] || [ $days_ago -eq 30 ]; then
    days_ago=$((days_ago - 1))
  fi
  
  new_date=$(date -v-${days_ago}d +%Y-%m-%d)
  sqlite3 $DB_PATH "UPDATE sessions SET date = '$new_date' WHERE id = $session_id"
  
  counter=$((counter + 1))
done

echo "Backdating Suljo's sessions..."

SULJO_SESSIONS=$(sqlite3 $DB_PATH "SELECT id FROM sessions WHERE user_id = $SULJO_ID ORDER BY id")

counter=0
for session_id in $SULJO_SESSIONS; do
  days_ago=$((60 - counter))
  
  # Skip days 40, 41, 50
  if [ $days_ago -eq 40 ] || [ $days_ago -eq 41 ] || [ $days_ago -eq 50 ]; then
    days_ago=$((days_ago - 1))
  fi
  
  new_date=$(date -v-${days_ago}d +%Y-%m-%d)
  sqlite3 $DB_PATH "UPDATE sessions SET date = '$new_date' WHERE id = $session_id"
  
  counter=$((counter + 1))
done

echo "Backdating Mujo's sessions..."

MUJO_SESSIONS=$(sqlite3 $DB_PATH "SELECT id FROM sessions WHERE user_id = $MUJO_ID ORDER BY id")

# Mujo's pattern: days 60-58, skip 57-54, days 53-52, skip 51-49, days 48-47, skip 46-45, days 44-1
day_pattern=(60 59 58 53 52 48 47)

# Add days 44 down to 1
for d in {44..1}; do
  day_pattern+=($d)
done

counter=0
for session_id in $MUJO_SESSIONS; do
  if [ $counter -lt ${#day_pattern[@]} ]; then
    days_ago=${day_pattern[$counter]}
    new_date=$(date -v-${days_ago}d +%Y-%m-%d)
    sqlite3 $DB_PATH "UPDATE sessions SET date = '$new_date' WHERE id = $session_id"
  fi
  
  counter=$((counter + 1))
done

echo ""
echo "✅ Dates fixed!"
echo ""
echo "Verifying..."
echo ""

echo "Hamo - First 3 and last 3 sessions:"
sqlite3 $DB_PATH "SELECT date, lesson_name FROM sessions WHERE user_id = $HAMO_ID ORDER BY date LIMIT 3"
echo "..."
sqlite3 $DB_PATH "SELECT date, lesson_name FROM sessions WHERE user_id = $HAMO_ID ORDER BY date DESC LIMIT 3"

echo ""
echo "Suljo - First 3 and last 3 sessions:"
sqlite3 $DB_PATH "SELECT date, lesson_name FROM sessions WHERE user_id = $SULJO_ID ORDER BY date LIMIT 3"
echo "..."
sqlite3 $DB_PATH "SELECT date, lesson_name FROM sessions WHERE user_id = $SULJO_ID ORDER BY date DESC LIMIT 3"

echo ""
echo "Mujo - First 3 and last 3 sessions:"
sqlite3 $DB_PATH "SELECT date, lesson_name FROM sessions WHERE user_id = $MUJO_ID ORDER BY date LIMIT 3"
echo "..."
sqlite3 $DB_PATH "SELECT date, lesson_name FROM sessions WHERE user_id = $MUJO_ID ORDER BY date DESC LIMIT 3"

echo ""
echo "✅ Demo users ready to test!"
echo "Open http://localhost:3001 and select Hamo, Suljo, or Mujo from user selector"
