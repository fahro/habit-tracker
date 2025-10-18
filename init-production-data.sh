#!/bin/bash

# Initialize Production Data for Railway
# This script creates demo users and sessions on Railway deployment

set -e

# Railway URL
RAILWAY_URL="${1:-https://atomic-habits-production-ecee.up.railway.app}"

echo "🚀 Initializing production data on: $RAILWAY_URL"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Check if server is healthy
echo -e "${BLUE}Checking server health...${NC}"
HEALTH=$(curl -s $RAILWAY_URL/api/health)
if [[ $HEALTH == *"ok"* ]]; then
    echo -e "${GREEN}✓ Server is healthy${NC}"
else
    echo -e "${RED}✗ Server is not responding${NC}"
    exit 1
fi
echo ""

# Create main user
echo -e "${BLUE}Creating user: Fahro${NC}"
curl -s -X POST $RAILWAY_URL/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Fahro","displayName":"Fahro","dailyGoalMinutes":30}' | jq -r '.name'
echo -e "${GREEN}✓ User created${NC}"
echo ""

# Add sessions
echo -e "${BLUE}Adding sessions...${NC}"
for i in {1..10}; do
  MINUTES=$((25 + RANDOM % 30))
  curl -s -X POST $RAILWAY_URL/api/webhook/message \
    -H "Content-Type: application/json" \
    -d "{\"author\":\"Fahro\",\"content\":\"Lesson $i ${MINUTES}m\"}" > /dev/null
  echo -e "${GREEN}  ✓ Session $i added (${MINUTES}m)${NC}"
  sleep 0.5
done
echo ""

# Set monthly goal
echo -e "${BLUE}Setting monthly goal for October 2025...${NC}"
curl -s -X POST $RAILWAY_URL/api/settings/monthly \
  -H "Content-Type: application/json" \
  -d '{"year":2025,"month":9,"dailyGoalMinutes":30}' | jq -r '.message'
echo -e "${GREEN}✓ Monthly goal set${NC}"
echo ""

# Verify data
echo -e "${BLUE}Verifying data...${NC}"
USERS=$(curl -s $RAILWAY_URL/api/users | jq 'length')
echo -e "  Users: ${GREEN}$USERS${NC}"

STATS=$(curl -s "$RAILWAY_URL/api/stats/overall?userId=1")
SESSIONS=$(echo $STATS | jq -r '.totalSessions')
HOURS=$(echo $STATS | jq -r '.totalHours')
MINUTES=$(echo $STATS | jq -r '.totalMinutes')
echo -e "  Sessions: ${GREEN}$SESSIONS${NC}"
echo -e "  Total time: ${GREEN}${HOURS}h ${MINUTES}m${NC}"
echo ""

echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Production data initialized successfully!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo "🌐 Open your app:"
echo "   $RAILWAY_URL"
echo ""
echo "👤 Login as: Fahro"
echo ""
