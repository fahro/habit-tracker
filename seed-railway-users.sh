#!/bin/bash

# Seed Railway Production with 3 Users and 3 Months of Data
# Dobri Haso, Pošteni Mujo, Lijeni Suljo

set -e

RAILWAY_URL="https://atomic-habits-production-ecee.up.railway.app"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Generisanje korisnika i podataka na Railway...${NC}"
echo ""

# Check server health
echo -e "${BLUE}Provjera servera...${NC}"
HEALTH=$(curl -s $RAILWAY_URL/api/health)
if [[ $HEALTH == *"ok"* ]]; then
    echo -e "${GREEN}✓ Server radi${NC}"
else
    echo -e "${RED}✗ Server ne reaguje${NC}"
    exit 1
fi
echo ""

# Set monthly goals for August, September, October
echo -e "${BLUE}Postavljanje mjesečnih ciljeva...${NC}"
for month in 7 8 9; do
    MONTH_NAME=("" "" "" "" "" "" "" "August" "Septembar" "Oktobar")
    curl -s -X POST $RAILWAY_URL/api/settings/monthly \
      -H "Content-Type: application/json" \
      -d "{\"year\":2025,\"month\":$month,\"dailyGoalMinutes\":30}" > /dev/null
    echo -e "${GREEN}  ✓ ${MONTH_NAME[$month]} 2025: 30 minuta${NC}"
done
echo ""

# Create users
echo -e "${BLUE}Kreiranje korisnika...${NC}"

# 1. Dobri Haso - odličan učenik
HASO_ID=$(curl -s -X POST $RAILWAY_URL/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Haso","displayName":"Dobri Haso","dailyGoalMinutes":30}' | jq -r '.id')
echo -e "${GREEN}  ✓ Dobri Haso (ID: $HASO_ID)${NC}"

# 2. Pošteni Mujo - dobar učenik
MUJO_ID=$(curl -s -X POST $RAILWAY_URL/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Mujo","displayName":"Pošteni Mujo","dailyGoalMinutes":30}' | jq -r '.id')
echo -e "${GREEN}  ✓ Pošteni Mujo (ID: $MUJO_ID)${NC}"

# 3. Lijeni Suljo - lijen, ima penale
SULJO_ID=$(curl -s -X POST $RAILWAY_URL/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Suljo","displayName":"Lijeni Suljo","dailyGoalMinutes":30}' | jq -r '.id')
echo -e "${GREEN}  ✓ Lijeni Suljo (ID: $SULJO_ID)${NC}"
echo ""

# Function to add session for specific date
add_session() {
    local user_id=$1
    local user_name=$2
    local date=$3
    local minutes=$4
    local lesson_num=$5
    
    curl -s -X POST "$RAILWAY_URL/api/sessions" \
      -H "Content-Type: application/json" \
      -d "{
        \"userId\": $user_id,
        \"lessonName\": \"Lesson $lesson_num\",
        \"duration\": $((minutes * 60)),
        \"date\": \"$date\"
      }" > /dev/null
}

# Generate sessions for AUGUST (2025-08-01 to 2025-08-31)
echo -e "${BLUE}Generisanje podataka za AUGUST 2025...${NC}"

lesson=1
for day in {1..31}; do
    date=$(printf "2025-08-%02d" $day)
    
    # DOBRI HASO - radi skoro svaki dan (90% dana)
    if [ $((RANDOM % 10)) -lt 9 ]; then
        minutes=$((35 + RANDOM % 30))  # 35-65 minuta
        add_session $HASO_ID "Haso" $date $minutes $lesson
        ((lesson++))
    fi
    
    # POŠTENI MUJO - radi većinu dana (75% dana)
    if [ $((RANDOM % 4)) -lt 3 ]; then
        minutes=$((30 + RANDOM % 25))  # 30-55 minuta
        add_session $MUJO_ID "Mujo" $date $minutes $lesson
        ((lesson++))
    fi
    
    # LIJENI SULJO - radi ponekad (50% dana, sa grupama propusta za penale)
    # Kreiraj grupe propusta za penale
    if [ $day -ge 5 ] && [ $day -le 6 ]; then
        # Propust 1: 5-6 avgust (2 dana = 1 penal)
        :
    elif [ $day -ge 15 ] && [ $day -le 16 ]; then
        # Propust 2: 15-16 avgust (2 dana = 1 penal)
        :
    else
        if [ $((RANDOM % 2)) -eq 0 ]; then
            minutes=$((25 + RANDOM % 20))  # 25-45 minuta
            add_session $SULJO_ID "Suljo" $date $minutes $lesson
            ((lesson++))
        fi
    fi
done
echo -e "${GREEN}  ✓ August podaci generisani${NC}"

# Generate sessions for SEPTEMBER (2025-09-01 to 2025-09-30)
echo -e "${BLUE}Generisanje podataka za SEPTEMBAR 2025...${NC}"

for day in {1..30}; do
    date=$(printf "2025-09-%02d" $day)
    
    # DOBRI HASO - nastavio odličan rad (90%)
    if [ $((RANDOM % 10)) -lt 9 ]; then
        minutes=$((35 + RANDOM % 30))
        add_session $HASO_ID "Haso" $date $minutes $lesson
        ((lesson++))
    fi
    
    # POŠTENI MUJO - nastavio dobro (75%)
    if [ $((RANDOM % 4)) -lt 3 ]; then
        minutes=$((30 + RANDOM % 25))
        add_session $MUJO_ID "Mujo" $date $minutes $lesson
        ((lesson++))
    fi
    
    # LIJENI SULJO - još gore (40% dana)
    if [ $day -ge 10 ] && [ $day -le 11 ]; then
        # Propust 3: 10-11 septembar (2 dana = 1 penal)
        :
    elif [ $day -ge 22 ] && [ $day -le 23 ]; then
        # Propust 4: 22-23 septembar (2 dana = 1 penal)
        :
    else
        if [ $((RANDOM % 5)) -lt 2 ]; then
            minutes=$((20 + RANDOM % 25))
            add_session $SULJO_ID "Suljo" $date $minutes $lesson
            ((lesson++))
        fi
    fi
done
echo -e "${GREEN}  ✓ Septembar podaci generisani${NC}"

# Generate sessions for OCTOBER (2025-10-01 to 2025-10-18, current day)
echo -e "${BLUE}Generisanje podataka za OKTOBAR 2025...${NC}"

for day in {1..18}; do
    date=$(printf "2025-10-%02d" $day)
    
    # DOBRI HASO - i dalje odličan (90%)
    if [ $((RANDOM % 10)) -lt 9 ]; then
        minutes=$((35 + RANDOM % 30))
        add_session $HASO_ID "Haso" $date $minutes $lesson
        ((lesson++))
    fi
    
    # POŠTENI MUJO - stabilan (75%)
    if [ $((RANDOM % 4)) -lt 3 ]; then
        minutes=$((30 + RANDOM % 25))
        add_session $MUJO_ID "Mujo" $date $minutes $lesson
        ((lesson++))
    fi
    
    # LIJENI SULJO - katastrofa (30% dana)
    if [ $day -ge 5 ] && [ $day -le 6 ]; then
        # Propust 5: 5-6 oktobar (2 dana = 1 penal)
        :
    elif [ $day -ge 12 ] && [ $day -le 13 ]; then
        # Propust 6: 12-13 oktobar (2 dana = 1 penal)
        :
    else
        if [ $((RANDOM % 10)) -lt 3 ]; then
            minutes=$((20 + RANDOM % 20))
            add_session $SULJO_ID "Suljo" $date $minutes $lesson
            ((lesson++))
        fi
    fi
done
echo -e "${GREEN}  ✓ Oktobar podaci generisani${NC}"
echo ""

# Update user creation dates to August 1st
echo -e "${BLUE}Ažuriranje datuma kreiranja korisnika...${NC}"
sqlite3 /tmp/temp.db "PRAGMA foreign_keys=ON;" 2>/dev/null || true
echo -e "${YELLOW}  (Ovo se mora uraditi ručno na Railway bazi)${NC}"
echo ""

# Show final statistics
echo -e "${BLUE}Statistike korisnika:${NC}"
echo ""

for user_id in $HASO_ID $MUJO_ID $SULJO_ID; do
    STATS=$(curl -s "$RAILWAY_URL/api/stats/overall?userId=$user_id")
    NAME=$(echo $STATS | jq -r '.dailyGoalMinutes' | head -1)
    
    if [ "$user_id" == "$HASO_ID" ]; then
        USER_NAME="Dobri Haso"
    elif [ "$user_id" == "$MUJO_ID" ]; then
        USER_NAME="Pošteni Mujo"
    else
        USER_NAME="Lijeni Suljo"
    fi
    
    SESSIONS=$(echo $STATS | jq -r '.totalSessions')
    HOURS=$(echo $STATS | jq -r '.totalHours')
    MINUTES=$(echo $STATS | jq -r '.totalMinutes')
    STREAK=$(echo $STATS | jq -r '.currentStreak')
    
    echo -e "${GREEN}$USER_NAME (ID: $user_id)${NC}"
    echo -e "  Sesije: $SESSIONS"
    echo -e "  Vrijeme: ${HOURS}h ${MINUTES}m"
    echo -e "  Trenutni streak: $STREAK dana"
    echo ""
done

echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Svi podaci uspješno generisani!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📋 Očekivani penali:${NC}"
echo -e "  ${GREEN}Dobri Haso: 0-1 penala${NC} (radi skoro svaki dan)"
echo -e "  ${BLUE}Pošteni Mujo: 1-2 penala${NC} (solidno radi)"
echo -e "  ${RED}Lijeni Suljo: 5-6 penala${NC} (lijen, propušta često)"
echo ""
echo -e "🌐 Otvorite: $RAILWAY_URL"
echo ""
