#!/bin/bash

echo "🧪 Testing Multi-User Functionality"
echo "===================================="
echo ""

BASE_URL="http://localhost:3001"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}1. Creating users via sessions${NC}"
echo ""

# Fahro adds sessions
echo "   👤 Fahro adding sessions..."
curl -s -X POST $BASE_URL/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Fahro",
    "message": "Game 1. Queen'\''s Gambit Study\n45m\nGame 2. Tactical Puzzles\n30m"
  }' | jq -r '"   ✅ Added \(.count) sessions for user: \(.user)"'

echo ""

# Marko adds sessions
echo "   👤 Marko adding sessions..."
curl -s -X POST $BASE_URL/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Marko",
    "message": "Game 1. Sicilian Defense\n1h 15m"
  }' | jq -r '"   ✅ Added \(.count) sessions for user: \(.user)"'

echo ""

# Ana adds sessions using message format
echo "   👤 Ana adding sessions with message format..."
curl -s -X POST $BASE_URL/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Ana:\nGame 1. Endgame Practice\n50m\nGame 2. Opening Repertoire\n25m"
  }' | jq -r '"   ✅ Added \(.count) sessions for user: \(.user)"'

echo ""
echo -e "${BLUE}2. Listing all users${NC}"
echo ""

curl -s $BASE_URL/api/users | jq -r '.[] | "   👤 \(.name) - Daily goal: \(.daily_goal_minutes) min - Created: \(.created_at)"'

echo ""
echo -e "${BLUE}3. Getting statistics for each user${NC}"
echo ""

# Get all users
USERS=$(curl -s $BASE_URL/api/users | jq -r '.[] | @base64')

for user in $USERS; do
    _jq() {
     echo ${user} | base64 --decode | jq -r ${1}
    }
    
    USER_ID=$(_jq '.id')
    USER_NAME=$(_jq '.name')
    
    echo "   📊 Statistics for $USER_NAME (ID: $USER_ID):"
    
    STATS=$(curl -s "$BASE_URL/api/stats/overall?userId=$USER_ID")
    
    echo $STATS | jq -r '"      Total Sessions: \(.totalSessions)"'
    echo $STATS | jq -r '"      Total Time: \(.totalHours)h \(.totalMinutes % 60)m"'
    echo $STATS | jq -r '"      Current Streak: \(.currentStreak) days"'
    echo $STATS | jq -r '"      Longest Streak: \(.longestStreak) days"'
    echo ""
done

echo -e "${BLUE}4. Testing webhook with username${NC}"
echo ""

curl -s -X POST $BASE_URL/api/webhook/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Fahro:\nGame 3. Advanced Tactics\n35m"
  }' | jq -r '"   ✅ \(.message)"'

echo ""
echo -e "${GREEN}✅ Multi-User Test Complete!${NC}"
echo ""
echo "📱 Open http://localhost:3001 to see the dashboard"
echo "🔄 Use the user selector dropdown to switch between users"
