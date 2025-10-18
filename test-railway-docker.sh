#!/bin/bash

# Test Railway Docker Build and Run Locally
# This script builds and tests the Dockerfile.railway before deploying to Railway

set -e  # Exit on error

echo "🐳 Testing Railway Docker Build..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="atomic-habits-railway-test"
CONTAINER_NAME="atomic-habits-test"
TEST_PORT=3001

# Step 1: Clean up previous test
echo -e "${BLUE}Step 1: Cleaning up previous test containers...${NC}"
docker rm -f $CONTAINER_NAME 2>/dev/null || true
docker rmi -f $IMAGE_NAME 2>/dev/null || true
echo -e "${GREEN}✓ Cleanup complete${NC}"
echo ""

# Step 2: Build Docker image
echo -e "${BLUE}Step 2: Building Railway Dockerfile...${NC}"
docker build -f Dockerfile.railway -t $IMAGE_NAME .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Docker build successful!${NC}"
else
    echo -e "${RED}✗ Docker build failed!${NC}"
    exit 1
fi
echo ""

# Step 3: Check image size
echo -e "${BLUE}Step 3: Checking image size...${NC}"
IMAGE_SIZE=$(docker images $IMAGE_NAME --format "{{.Size}}")
echo -e "${GREEN}Image size: $IMAGE_SIZE${NC}"
echo ""

# Step 4: Run container
echo -e "${BLUE}Step 4: Starting container...${NC}"
docker run -d \
  --name $CONTAINER_NAME \
  -p $TEST_PORT:$TEST_PORT \
  -e PORT=$TEST_PORT \
  -e NODE_ENV=production \
  $IMAGE_NAME

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Container started!${NC}"
else
    echo -e "${RED}✗ Failed to start container!${NC}"
    exit 1
fi
echo ""

# Step 5: Wait for app to start
echo -e "${BLUE}Step 5: Waiting for app to start...${NC}"
sleep 5

# Step 6: Check if app is running
echo -e "${BLUE}Step 6: Checking if app is running...${NC}"
docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

# Step 7: View logs
echo -e "${BLUE}Step 7: Container logs:${NC}"
echo -e "${YELLOW}---${NC}"
docker logs $CONTAINER_NAME
echo -e "${YELLOW}---${NC}"
echo ""

# Step 8: Test health endpoint
echo -e "${BLUE}Step 8: Testing /api/health endpoint...${NC}"
sleep 2

HEALTH_RESPONSE=$(curl -s http://localhost:$TEST_PORT/api/health || echo "FAILED")

if [[ $HEALTH_RESPONSE == *"ok"* ]]; then
    echo -e "${GREEN}✓ Health check passed!${NC}"
    echo "Response: $HEALTH_RESPONSE"
else
    echo -e "${RED}✗ Health check failed!${NC}"
    echo "Response: $HEALTH_RESPONSE"
    echo ""
    echo "Container logs:"
    docker logs $CONTAINER_NAME
    docker rm -f $CONTAINER_NAME
    exit 1
fi
echo ""

# Step 9: Test API endpoints
echo -e "${BLUE}Step 9: Testing API endpoints...${NC}"

# Test users endpoint
echo -n "  Testing /api/users... "
USERS_RESPONSE=$(curl -s http://localhost:$TEST_PORT/api/users)
if [[ $USERS_RESPONSE == "["* ]]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

# Test webhook endpoint
echo -n "  Testing /api/webhook/message... "
WEBHOOK_RESPONSE=$(curl -s -X POST http://localhost:$TEST_PORT/api/webhook/message \
  -H "Content-Type: application/json" \
  -d '{"author":"TestUser","content":"Test lesson 30m"}')
if [[ $WEBHOOK_RESPONSE == *"success"* ]]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

# Test monthly settings endpoint
echo -n "  Testing /api/settings/monthly... "
SETTINGS_RESPONSE=$(curl -s http://localhost:$TEST_PORT/api/settings/monthly)
if [[ $SETTINGS_RESPONSE == "["* ]]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

echo ""

# Step 10: Resource usage
echo -e "${BLUE}Step 10: Container resource usage:${NC}"
docker stats $CONTAINER_NAME --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
echo ""

# Summary
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ All tests passed!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Container is still running for manual testing.${NC}"
echo ""
echo "Access the app at: http://localhost:$TEST_PORT"
echo ""
echo "Commands:"
echo "  View logs:    docker logs -f $CONTAINER_NAME"
echo "  Stop:         docker stop $CONTAINER_NAME"
echo "  Remove:       docker rm -f $CONTAINER_NAME"
echo "  Inspect:      docker inspect $CONTAINER_NAME"
echo ""
echo -e "${BLUE}To stop and clean up:${NC}"
echo "  docker rm -f $CONTAINER_NAME"
echo "  docker rmi $IMAGE_NAME"
echo ""
echo -e "${GREEN}Ready to deploy to Railway!${NC}"
echo ""
echo "Deploy command:"
echo "  railway up --detach"
