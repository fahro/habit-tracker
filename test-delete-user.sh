#!/bin/bash

echo "🧪 Testing User Deletion"
echo "========================"
echo ""

BASE_URL="http://localhost:3001"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}1. Creating test users${NC}"
echo ""

# Create test users
echo "   👤 Creating TestUser1..."
curl -s -X POST $BASE_URL/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "testuser1",
    "displayName": "Test User 1",
    "dailyGoalMinutes": 30
  }' | jq -r '"   ✅ Created: \(.display_name) (ID: \(.id))"'

echo ""

echo "   👤 Creating TestUser2..."
curl -s -X POST $BASE_URL/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "testuser2",
    "displayName": "Test User 2",
    "dailyGoalMinutes": 45
  }' | jq -r '"   ✅ Created: \(.display_name) (ID: \(.id))"'

echo ""
echo -e "${BLUE}2. Adding sessions to TestUser1${NC}"
echo ""

curl -s -X POST $BASE_URL/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser1",
    "message": "Game 1. Test Session\n30m"
  }' | jq -r '"   ✅ Added \(.count) session(s) for \(.user)"'

echo ""
echo -e "${BLUE}3. Listing all users before deletion${NC}"
echo ""

USERS_BEFORE=$(curl -s $BASE_URL/api/users)
echo "$USERS_BEFORE" | jq -r '.[] | "   👤 \(.display_name) (@\(.name)) - ID: \(.id)"'
USER_COUNT_BEFORE=$(echo "$USERS_BEFORE" | jq -r '. | length')
echo ""
echo "   Total users: $USER_COUNT_BEFORE"

echo ""
echo -e "${BLUE}4. Testing deletion of non-existent user (should fail)${NC}"
echo ""

echo "   ⚠️  Trying to delete user ID 9999..."
RESPONSE=$(curl -s -X DELETE $BASE_URL/api/users/9999)
if echo "$RESPONSE" | jq -e '.error' > /dev/null; then
    echo "   ✅ Correctly rejected: $(echo $RESPONSE | jq -r '.error')"
else
    echo "   ❌ Expected error but got success"
fi

echo ""
echo -e "${BLUE}5. Getting TestUser1 ID${NC}"
echo ""

TEST_USER_ID=$(curl -s $BASE_URL/api/users | jq -r '.[] | select(.name == "testuser1") | .id')
echo "   TestUser1 ID: $TEST_USER_ID"

echo ""
echo -e "${BLUE}6. Checking sessions for TestUser1 before deletion${NC}"
echo ""

SESSIONS_BEFORE=$(curl -s "$BASE_URL/api/sessions?userId=$TEST_USER_ID" | jq -r '. | length')
echo "   Sessions for TestUser1: $SESSIONS_BEFORE"

echo ""
echo -e "${BLUE}7. Deleting TestUser1${NC}"
echo ""

DELETE_RESPONSE=$(curl -s -X DELETE $BASE_URL/api/users/$TEST_USER_ID)
if echo "$DELETE_RESPONSE" | jq -e '.success' > /dev/null; then
    echo "   ✅ $(echo $DELETE_RESPONSE | jq -r '.message')"
else
    echo "   ❌ Failed: $(echo $DELETE_RESPONSE | jq -r '.error')"
fi

echo ""
echo -e "${BLUE}8. Listing users after deletion${NC}"
echo ""

USERS_AFTER=$(curl -s $BASE_URL/api/users)
echo "$USERS_AFTER" | jq -r '.[] | "   👤 \(.display_name) (@\(.name)) - ID: \(.id)"'
USER_COUNT_AFTER=$(echo "$USERS_AFTER" | jq -r '. | length')
echo ""
echo "   Total users: $USER_COUNT_AFTER"

echo ""
echo -e "${BLUE}9. Verifying TestUser1 sessions were deleted${NC}"
echo ""

SESSIONS_AFTER=$(curl -s "$BASE_URL/api/sessions?userId=$TEST_USER_ID" | jq -r '. | length')
echo "   Sessions for TestUser1 after deletion: $SESSIONS_AFTER"

if [ "$SESSIONS_AFTER" == "0" ] || [ -z "$SESSIONS_AFTER" ]; then
    echo "   ✅ Sessions successfully deleted (cascade delete working)"
else
    echo "   ❌ Sessions still exist (cascade delete failed)"
fi

echo ""
echo -e "${BLUE}10. Testing deletion of last remaining user (should fail)${NC}"
echo ""

# Get remaining users
REMAINING_USERS=$(curl -s $BASE_URL/api/users | jq -r '. | length')
echo "   Remaining users: $REMAINING_USERS"

# If there's only one user, try to delete it (should fail)
if [ "$REMAINING_USERS" == "1" ]; then
    LAST_USER_ID=$(curl -s $BASE_URL/api/users | jq -r '.[0].id')
    echo "   ⚠️  Trying to delete the last user (ID: $LAST_USER_ID)..."
    
    LAST_DELETE_RESPONSE=$(curl -s -X DELETE $BASE_URL/api/users/$LAST_USER_ID)
    if echo "$LAST_DELETE_RESPONSE" | jq -e '.error' > /dev/null; then
        echo "   ✅ Correctly prevented: $(echo $LAST_DELETE_RESPONSE | jq -r '.error')"
    else
        echo "   ❌ Should not allow deleting last user"
    fi
else
    echo "   ℹ️  Multiple users remaining, skipping last-user deletion test"
fi

echo ""
echo -e "${GREEN}✅ User Deletion Test Complete!${NC}"
echo ""
echo "Summary:"
echo "   - Users before deletion: $USER_COUNT_BEFORE"
echo "   - Users after deletion: $USER_COUNT_AFTER"
echo "   - Sessions cascade deleted: $([ "$SESSIONS_AFTER" == "0" ] && echo "✅ Yes" || echo "❌ No")"
echo ""
echo "🌐 Open http://localhost:3001 and go to 'Korisnici' tab"
echo "🗑️  Try deleting a user via the UI to see the confirmation dialog"
