#!/bin/bash

echo "🧪 Testing User Management"
echo "=========================="
echo ""

BASE_URL="http://localhost:3001"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}1. Creating new users via API${NC}"
echo ""

# Create user 1
echo "   👤 Creating user: Developer..."
curl -s -X POST $BASE_URL/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "developer",
    "displayName": "Software Developer",
    "dailyGoalMinutes": 120
  }' | jq -r '"   ✅ Created: \(.display_name) (Goal: \(.daily_goal_minutes) min/day)"'

echo ""

# Create user 2
echo "   👤 Creating user: Student..."
curl -s -X POST $BASE_URL/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "student",
    "displayName": "University Student",
    "dailyGoalMinutes": 90
  }' | jq -r '"   ✅ Created: \(.display_name) (Goal: \(.daily_goal_minutes) min/day)"'

echo ""

# Create user 3
echo "   👤 Creating user: Beginner..."
curl -s -X POST $BASE_URL/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "beginner",
    "displayName": "Chess Beginner",
    "dailyGoalMinutes": 15
  }' | jq -r '"   ✅ Created: \(.display_name) (Goal: \(.daily_goal_minutes) min/day)"'

echo ""
echo -e "${BLUE}2. Listing all users${NC}"
echo ""

USERS=$(curl -s $BASE_URL/api/users)
echo "$USERS" | jq -r '.[] | "   👤 \(.display_name) (@\(.name)) - \(.daily_goal_minutes) min/day - Created: \(.created_at)"'

echo ""
echo -e "${BLUE}3. Testing duplicate user (should fail gracefully)${NC}"
echo ""

echo "   ⚠️  Trying to create duplicate 'developer'..."
RESPONSE=$(curl -s -X POST $BASE_URL/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "developer",
    "displayName": "Another Developer",
    "dailyGoalMinutes": 60
  }')

if echo "$RESPONSE" | jq -e '.error' > /dev/null; then
    echo "   ✅ Correctly rejected: $(echo $RESPONSE | jq -r '.error')"
else
    echo "   ❌ Expected error but got success"
fi

echo ""
echo -e "${BLUE}4. Updating user settings${NC}"
echo ""

# Get a user ID
USER_ID=$(curl -s $BASE_URL/api/users | jq -r '.[0].id')
USER_NAME=$(curl -s $BASE_URL/api/users | jq -r '.[0].name')

echo "   📝 Updating user $USER_NAME (ID: $USER_ID) goal to 45 minutes..."
curl -s -X PUT $BASE_URL/api/users/$USER_ID \
  -H "Content-Type: application/json" \
  -d '{
    "dailyGoalMinutes": 45
  }' > /dev/null

# Verify update
NEW_GOAL=$(curl -s $BASE_URL/api/users/$USER_ID | jq -r '.daily_goal_minutes')
echo "   ✅ Updated successfully! New goal: $NEW_GOAL min/day"

echo ""
echo -e "${BLUE}5. Adding sessions for different users${NC}"
echo ""

# Add session for developer
echo "   📚 Developer studying..."
curl -s -X POST $BASE_URL/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "username": "developer",
    "message": "Advanced Algorithms\n2h 30m"
  }' | jq -r '"   ✅ \(.user): Added \(.count) session(s)"'

echo ""

# Add session for student
echo "   📚 Student studying..."
curl -s -X POST $BASE_URL/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "username": "student",
    "message": "Calculus II\n1h 45m"
  }' | jq -r '"   ✅ \(.user): Added \(.count) session(s)"'

echo ""

# Add session for beginner
echo "   📚 Beginner studying..."
curl -s -X POST $BASE_URL/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "username": "beginner",
    "message": "Basic Tactics\n20m"
  }' | jq -r '"   ✅ \(.user): Added \(.count) session(s)"'

echo ""
echo -e "${BLUE}6. Checking statistics for each user${NC}"
echo ""

for user in $(curl -s $BASE_URL/api/users | jq -r '.[] | @base64'); do
    _jq() {
     echo ${user} | base64 --decode | jq -r ${1}
    }
    
    USER_ID=$(_jq '.id')
    USER_NAME=$(_jq '.display_name')
    USER_GOAL=$(_jq '.daily_goal_minutes')
    
    echo "   📊 $USER_NAME (Goal: $USER_GOAL min):"
    
    STATS=$(curl -s "$BASE_URL/api/stats/overall?userId=$USER_ID")
    
    TOTAL_SESSIONS=$(echo $STATS | jq -r '.totalSessions')
    TOTAL_TIME=$(echo $STATS | jq -r '.totalHours')
    TOTAL_MIN=$(echo $STATS | jq -r '(.totalMinutes % 60)')
    
    if [ "$TOTAL_SESSIONS" -gt "0" ]; then
        echo "      Sessions: $TOTAL_SESSIONS | Time: ${TOTAL_TIME}h ${TOTAL_MIN}m"
    else
        echo "      No sessions yet"
    fi
    echo ""
done

echo -e "${GREEN}✅ User Management Test Complete!${NC}"
echo ""
echo "🌐 Open http://localhost:3001 and click the 'Korisnici' tab"
echo "👥 You should see all created users with options to:"
echo "   - View user list with avatars"
echo "   - Edit daily goals"
echo "   - Create new users via the UI"
echo ""
echo "🔄 Try creating a user via the UI and switching between users"
