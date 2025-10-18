#!/bin/bash

# Seed Treniram.up.railway.app with 3 Demo Users and 3 Months of Data
# Hamo (odličan), Suljo (solidan), Mujo (lijen)

set -e

RAILWAY_URL="https://treniram.up.railway.app"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Generisanje demo korisnika na Treniram Railway...${NC}"
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

# Get current month and calculate last 3 months
CURRENT_YEAR=$(date +%Y)
CURRENT_MONTH=$(date +%-m)

# Calculate last 3 months
MONTH_1=$((CURRENT_MONTH - 2))
MONTH_2=$((CURRENT_MONTH - 1))
MONTH_3=$CURRENT_MONTH

YEAR_1=$CURRENT_YEAR
YEAR_2=$CURRENT_YEAR
YEAR_3=$CURRENT_YEAR

# Handle year wraparound
if [ $MONTH_1 -le 0 ]; then
    MONTH_1=$((12 + MONTH_1))
    YEAR_1=$((CURRENT_YEAR - 1))
fi
if [ $MONTH_2 -le 0 ]; then
    MONTH_2=$((12 + MONTH_2))
    YEAR_2=$((CURRENT_YEAR - 1))
fi

# Function to get month name
get_month_name() {
    case $1 in
        1) echo "Januar" ;;
        2) echo "Februar" ;;
        3) echo "Mart" ;;
        4) echo "April" ;;
        5) echo "Maj" ;;
        6) echo "Jun" ;;
        7) echo "Jul" ;;
        8) echo "August" ;;
        9) echo "Septembar" ;;
        10) echo "Oktobar" ;;
        11) echo "Novembar" ;;
        12) echo "Decembar" ;;
    esac
}

echo -e "${BLUE}Generisanje za mjesece:${NC}"
echo -e "  $(get_month_name $MONTH_1) $YEAR_1 (mjesec -2)"
echo -e "  $(get_month_name $MONTH_2) $YEAR_2 (mjesec -1)"
echo -e "  $(get_month_name $MONTH_3) $YEAR_3 (trenutni mjesec)"
echo ""

# Set monthly goals for the 3 months
echo -e "${BLUE}Postavljanje mjesečnih ciljeva...${NC}"
curl -s -X POST $RAILWAY_URL/api/settings/monthly \
  -H "Content-Type: application/json" \
  -d "{\"year\":$YEAR_1,\"month\":$MONTH_1,\"dailyGoalMinutes\":30}" > /dev/null
echo -e "${GREEN}  ✓ $(get_month_name $MONTH_1) $YEAR_1: 30 minuta${NC}"

curl -s -X POST $RAILWAY_URL/api/settings/monthly \
  -H "Content-Type: application/json" \
  -d "{\"year\":$YEAR_2,\"month\":$MONTH_2,\"dailyGoalMinutes\":30}" > /dev/null
echo -e "${GREEN}  ✓ $(get_month_name $MONTH_2) $YEAR_2: 30 minuta${NC}"

curl -s -X POST $RAILWAY_URL/api/settings/monthly \
  -H "Content-Type: application/json" \
  -d "{\"year\":$YEAR_3,\"month\":$MONTH_3,\"dailyGoalMinutes\":30}" > /dev/null
echo -e "${GREEN}  ✓ $(get_month_name $MONTH_3) $YEAR_3: 30 minuta${NC}"
echo ""

# Create users (without dailyGoalMinutes since it's now monthly)
echo -e "${BLUE}Kreiranje korisnika...${NC}"

# 1. Hamo - odličan učenik
HAMO_ID=$(curl -s -X POST $RAILWAY_URL/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Hamo","displayName":"Odličan Hamo"}' | jq -r '.id')
echo -e "${GREEN}  ✓ Odličan Hamo (ID: $HAMO_ID)${NC}"

# 2. Suljo - solidan učenik
SULJO_ID=$(curl -s -X POST $RAILWAY_URL/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Suljo","displayName":"Solidni Suljo"}' | jq -r '.id')
echo -e "${GREEN}  ✓ Solidni Suljo (ID: $SULJO_ID)${NC}"

# 3. Mujo - lijen učenik
MUJO_ID=$(curl -s -X POST $RAILWAY_URL/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Mujo","displayName":"Lijeni Mujo"}' | jq -r '.id')
echo -e "${GREEN}  ✓ Lijeni Mujo (ID: $MUJO_ID)${NC}"
echo ""

# Function to add session for specific date
add_session() {
    local user_id=$1
    local date=$2
    local minutes=$3
    local lesson_num=$4
    
    curl -s -X POST "$RAILWAY_URL/api/sessions" \
      -H "Content-Type: application/json" \
      -d "{
        \"userId\": $user_id,
        \"lessonName\": \"Lesson $lesson_num\",
        \"duration\": $((minutes * 60)),
        \"date\": \"$date\"
      }" > /dev/null
}

# Get days in month function
days_in_month() {
    local year=$1
    local month=$2
    cal $month $year | awk 'NF {DAYS = $NF}; END {print DAYS}'
}

# Generate sessions for MONTH 1
echo -e "${BLUE}Generisanje podataka za $(get_month_name $MONTH_1) $YEAR_1...${NC}"

DAYS_M1=$(days_in_month $YEAR_1 $MONTH_1)
lesson=1
for day in $(seq 1 $DAYS_M1); do
    date=$(printf "%d-%02d-%02d" $YEAR_1 $MONTH_1 $day)
    
    # HAMO - radi skoro svaki dan (90% dana)
    if [ $((RANDOM % 10)) -lt 9 ]; then
        minutes=$((35 + RANDOM % 30))  # 35-65 minuta
        add_session $HAMO_ID "$date" $minutes $lesson
        ((lesson++))
    fi
    
    # SULJO - radi većinu dana (75% dana)
    if [ $((RANDOM % 4)) -lt 3 ]; then
        minutes=$((30 + RANDOM % 25))  # 30-55 minuta
        add_session $SULJO_ID "$date" $minutes $lesson
        ((lesson++))
    fi
    
    # MUJO - radi ponekad (50% dana, sa grupama propusta)
    if [ $day -ge 8 ] && [ $day -le 9 ]; then
        # Propust: 2 dana = 1 penal
        :
    elif [ $day -ge 20 ] && [ $day -le 21 ]; then
        # Propust: 2 dana = 1 penal
        :
    else
        if [ $((RANDOM % 2)) -eq 0 ]; then
            minutes=$((25 + RANDOM % 20))  # 25-45 minuta
            add_session $MUJO_ID "$date" $minutes $lesson
            ((lesson++))
        fi
    fi
done
echo -e "${GREEN}  ✓ $(get_month_name $MONTH_1) podaci generisani${NC}"

# Generate sessions for MONTH 2
echo -e "${BLUE}Generisanje podataka za $(get_month_name $MONTH_2) $YEAR_2...${NC}"

DAYS_M2=$(days_in_month $YEAR_2 $MONTH_2)
lesson=1
for day in $(seq 1 $DAYS_M2); do
    date=$(printf "%d-%02d-%02d" $YEAR_2 $MONTH_2 $day)
    
    # HAMO - radi skoro svaki dan (90%)
    if [ $((RANDOM % 10)) -lt 9 ]; then
        minutes=$((35 + RANDOM % 30))
        add_session $HAMO_ID "$date" $minutes $lesson
        ((lesson++))
    fi
    
    # SULJO - radi većinu dana (75%)
    if [ $((RANDOM % 4)) -lt 3 ]; then
        minutes=$((30 + RANDOM % 25))
        add_session $SULJO_ID "$date" $minutes $lesson
        ((lesson++))
    fi
    
    # MUJO - radi ponekad (50%)
    if [ $day -ge 5 ] && [ $day -le 6 ]; then
        # Propust: 2 dana
        :
    elif [ $day -ge 15 ] && [ $day -le 16 ]; then
        # Propust: 2 dana
        :
    else
        if [ $((RANDOM % 2)) -eq 0 ]; then
            minutes=$((25 + RANDOM % 20))
            add_session $MUJO_ID "$date" $minutes $lesson
            ((lesson++))
        fi
    fi
done
echo -e "${GREEN}  ✓ $(get_month_name $MONTH_2) podaci generisani${NC}"

# Generate sessions for MONTH 3 (current month, up to today)
echo -e "${BLUE}Generisanje podataka za $(get_month_name $MONTH_3) $YEAR_3...${NC}"

CURRENT_DAY=$(date +%-d)
lesson=1
for day in $(seq 1 $CURRENT_DAY); do
    date=$(printf "%d-%02d-%02d" $YEAR_3 $MONTH_3 $day)
    
    # HAMO - nastavio odličan rad (90%)
    if [ $((RANDOM % 10)) -lt 9 ]; then
        minutes=$((35 + RANDOM % 30))
        add_session $HAMO_ID "$date" $minutes $lesson
        ((lesson++))
    fi
    
    # SULJO - nastavio dobro (75%)
    if [ $((RANDOM % 4)) -lt 3 ]; then
        minutes=$((30 + RANDOM % 25))
        add_session $SULJO_ID "$date" $minutes $lesson
        ((lesson++))
    fi
    
    # MUJO - još gore (40%)
    if [ $day -ge 5 ] && [ $day -le 6 ]; then
        # Propust
        :
    elif [ $day -ge 12 ] && [ $day -le 13 ]; then
        # Propust
        :
    else
        if [ $((RANDOM % 10)) -lt 4 ]; then
            minutes=$((20 + RANDOM % 25))
            add_session $MUJO_ID "$date" $minutes $lesson
            ((lesson++))
        fi
    fi
done
echo -e "${GREEN}  ✓ $(get_month_name $MONTH_3) podaci generisani${NC}"
echo ""

# Update user creation dates to the start of month 1
START_DATE=$(printf "%d-%02d-01 00:00:00" $YEAR_1 $MONTH_1)
echo -e "${BLUE}Ažuriranje datuma kreiranja korisnika na $START_DATE...${NC}"
for user_id in $HAMO_ID $SULJO_ID $MUJO_ID; do
  curl -s -X PATCH $RAILWAY_URL/api/users/$user_id/created-at \
    -H "Content-Type: application/json" \
    -d "{\"createdAt\":\"$START_DATE\"}" > /dev/null
done
echo -e "${GREEN}  ✓ Datumi ažurirani${NC}"
echo ""

# Show final statistics
echo -e "${BLUE}Statistike korisnika:${NC}"
echo ""

for user_id in $HAMO_ID $SULJO_ID $MUJO_ID; do
    STATS=$(curl -s "$RAILWAY_URL/api/stats/overall?userId=$user_id")
    
    if [ "$user_id" == "$HAMO_ID" ]; then
        USER_NAME="Odličan Hamo"
    elif [ "$user_id" == "$SULJO_ID" ]; then
        USER_NAME="Solidni Suljo"
    else
        USER_NAME="Lijeni Mujo"
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
echo -e "${YELLOW}📋 Očekivani obrasci:${NC}"
echo -e "  ${GREEN}Odličan Hamo:${NC} radi ~90% dana, minimalno penala"
echo -e "  ${BLUE}Solidni Suljo:${NC} radi ~75% dana, poneki penal"
echo -e "  ${RED}Lijeni Mujo:${NC} radi ~40-50% dana, više penala"
echo ""
echo -e "🌐 Otvorite: $RAILWAY_URL"
echo ""
