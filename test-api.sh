#!/bin/bash

# AI Code Review System - API Testing Script
# This script tests all API endpoints

BASE_URL="http://localhost:3000"
USER_ID="demo-user"

echo "================================"
echo "AI Code Review System - API Test"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Create a new project
echo -e "${YELLOW}Test 1: Creating a new project...${NC}"
PROJECT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/projects" \
  -H "Content-Type: application/json" \
  -H "x-user-id: $USER_ID" \
  -d '{
    "name": "Test Project",
    "description": "A test project for API testing"
  }')

PROJECT_ID=$(echo $PROJECT_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -n "$PROJECT_ID" ]; then
  echo -e "${GREEN}✓ Project created successfully${NC}"
  echo "  Project ID: $PROJECT_ID"
else
  echo -e "${RED}✗ Failed to create project${NC}"
  echo "  Response: $PROJECT_RESPONSE"
  exit 1
fi
echo ""

# Test 2: Get all projects
echo -e "${YELLOW}Test 2: Fetching all projects...${NC}"
PROJECTS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/projects" \
  -H "x-user-id: $USER_ID")

if echo "$PROJECTS_RESPONSE" | grep -q "success"; then
  echo -e "${GREEN}✓ Projects fetched successfully${NC}"
  echo "  Response: $PROJECTS_RESPONSE" | head -c 200
  echo "..."
else
  echo -e "${RED}✗ Failed to fetch projects${NC}"
fi
echo ""

# Test 3: Upload files to project
echo -e "${YELLOW}Test 3: Uploading files to project...${NC}"
UPLOAD_RESPONSE=$(curl -s -X POST "$BASE_URL/api/files/upload" \
  -H "Content-Type: application/json" \
  -H "x-user-id: $USER_ID" \
  -d "{
    \"projectId\": \"$PROJECT_ID\",
    \"files\": [
      {
        \"path\": \"test.js\",
        \"content\": \"function test() { console.log('Hello'); var x = 1; eval('alert(1)'); }\"
      },
      {
        \"path\": \"app.py\",
        \"content\": \"def hello():\\n    password = 'hardcoded123'\\n    return password\"
      }
    ]
  }")

FILE_ID=$(echo $UPLOAD_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$FILE_ID" ]; then
  echo -e "${GREEN}✓ Files uploaded successfully${NC}"
  echo "  File ID: $FILE_ID"
else
  echo -e "${RED}✗ Failed to upload files${NC}"
  echo "  Response: $UPLOAD_RESPONSE"
fi
echo ""

# Test 4: Get project details
echo -e "${YELLOW}Test 4: Fetching project details...${NC}"
PROJECT_DETAILS=$(curl -s -X GET "$BASE_URL/api/projects/$PROJECT_ID")

if echo "$PROJECT_DETAILS" | grep -q "test.js"; then
  echo -e "${GREEN}✓ Project details fetched successfully${NC}"
  echo "  Files found in project"
else
  echo -e "${RED}✗ Failed to fetch project details${NC}"
fi
echo ""

# Test 5: Get file details
echo -e "${YELLOW}Test 5: Fetching file details...${NC}"
FILE_DETAILS=$(curl -s -X GET "$BASE_URL/api/files/$FILE_ID")

if echo "$FILE_DETAILS" | grep -q "content"; then
  echo -e "${GREEN}✓ File details fetched successfully${NC}"
else
  echo -e "${RED}✗ Failed to fetch file details${NC}"
fi
echo ""

# Test 6: Run analysis on file
echo -e "${YELLOW}Test 6: Running AI analysis on file...${NC}"
ANALYSIS_RESPONSE=$(curl -s -X POST "$BASE_URL/api/analysis/run" \
  -H "Content-Type: application/json" \
  -d "{
    \"fileId\": \"$FILE_ID\",
    \"analysisTypes\": [\"bug\", \"security\"]
  }")

ANALYSIS_ID=$(echo $ANALYSIS_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$ANALYSIS_ID" ]; then
  echo -e "${GREEN}✓ Analysis completed successfully${NC}"
  echo "  Analysis ID: $ANALYSIS_ID"
else
  echo -e "${RED}✗ Failed to run analysis${NC}"
  echo "  Response: $ANALYSIS_RESPONSE"
fi
echo ""

# Test 7: Get analysis results
echo -e "${YELLOW}Test 7: Fetching analysis results...${NC}"
ANALYSIS_DETAILS=$(curl -s -X GET "$BASE_URL/api/analysis/$ANALYSIS_ID")

if echo "$ANALYSIS_DETAILS" | grep -q "results"; then
  echo -e "${GREEN}✓ Analysis results fetched successfully${NC}"
else
  echo -e "${RED}✗ Failed to fetch analysis results${NC}"
fi
echo ""

# Test 8: Get project analysis summary
echo -e "${YELLOW}Test 8: Fetching project analysis summary...${NC}"
PROJECT_ANALYSIS=$(curl -s -X GET "$BASE_URL/api/analysis/project/$PROJECT_ID")

if echo "$PROJECT_ANALYSIS" | grep -q "stats"; then
  echo -e "${GREEN}✓ Project analysis summary fetched successfully${NC}"
else
  echo -e "${RED}✗ Failed to fetch project analysis summary${NC}"
fi
echo ""

# Test 9: Delete file
echo -e "${YELLOW}Test 9: Deleting file...${NC}"
DELETE_FILE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/api/files/$FILE_ID")

if echo "$DELETE_FILE_RESPONSE" | grep -q "success"; then
  echo -e "${GREEN}✓ File deleted successfully${NC}"
else
  echo -e "${RED}✗ Failed to delete file${NC}"
fi
echo ""

# Test 10: Delete project
echo -e "${YELLOW}Test 10: Deleting project...${NC}"
DELETE_PROJECT_RESPONSE=$(curl -s -X DELETE "$BASE_URL/api/projects/$PROJECT_ID")

if echo "$DELETE_PROJECT_RESPONSE" | grep -q "success"; then
  echo -e "${GREEN}✓ Project deleted successfully${NC}"
else
  echo -e "${RED}✗ Failed to delete project${NC}"
fi
echo ""

echo "================================"
echo -e "${GREEN}All API tests completed!${NC}"
echo "================================"
