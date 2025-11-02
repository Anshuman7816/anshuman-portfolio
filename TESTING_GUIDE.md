# Testing Guide

This guide provides instructions for testing the AI Code Review System.

## Prerequisites

Before testing, ensure:
1. PostgreSQL database is running
2. Environment variables are configured in `.env`
3. Prisma client is generated: `npx prisma generate`
4. Database schema is created: `npx prisma db push`
5. Application is built: `npm run build`

## Starting the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Manual Testing Workflow

### 1. User Registration and Authentication

1. Navigate to `http://localhost:3000`
2. Click on "Register" tab
3. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Password: test123
4. Click "Register"
5. You should be redirected to the dashboard

### 2. Create a Project

1. On the dashboard, click "New Project"
2. Enter:
   - Project Name: Test Project
   - Description: My first test project
3. Click "Create"
4. The project should appear in the project list

### 3. Upload Files

1. Click on the project card to open it
2. Click "Upload Files" button
3. Select one or more code files (e.g., .js, .ts, .py files)
4. Files should appear in the left sidebar

### 4. Run Code Analysis

1. Select a file from the sidebar
2. The file content will be displayed
3. Click "Run Analysis" button
4. Wait for analysis to complete
5. Analysis results will appear below the code viewer
6. Results are categorized by:
   - Type (bug, security, performance, quality)
   - Severity (critical, high, medium, low)
   - Line numbers
   - Suggestions for fixes

### 5. View Multiple Files

1. Click on different files in the sidebar
2. Each file can be analyzed independently
3. Analysis results are saved and can be viewed later

## API Testing with cURL

### Setup
```bash
# Set your base URL
BASE_URL="http://localhost:3000/api"
```

### 1. Register a User
```bash
curl -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "name": "Test User"
  }'
```

Expected response:
```json
{
  "user": {
    "id": "...",
    "email": "test@example.com",
    "name": "Test User"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Save the token for subsequent requests:
```bash
TOKEN="your_token_here"
```

### 2. Login
```bash
curl -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

### 3. Create a Project
```bash
curl -X POST $BASE_URL/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Project",
    "description": "A test project for API testing"
  }'
```

Save the project ID:
```bash
PROJECT_ID="your_project_id_here"
```

### 4. List Projects
```bash
curl -X GET $BASE_URL/projects \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Upload Files
```bash
curl -X POST $BASE_URL/files/upload \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "projectId": "'$PROJECT_ID'",
    "files": [
      {
        "path": "index.js",
        "content": "function test() {\n  var x = 5;\n  if (x == 5) {\n    console.log(\"test\");\n  }\n}"
      },
      {
        "path": "utils.js",
        "content": "const add = (a, b) => a + b;\nconst multiply = (a, b) => a * b;"
      }
    ]
  }'
```

Save a file ID:
```bash
FILE_ID="your_file_id_here"
```

### 6. Get Project Details
```bash
curl -X GET $BASE_URL/projects/$PROJECT_ID \
  -H "Authorization: Bearer $TOKEN"
```

### 7. Run Analysis
```bash
curl -X POST $BASE_URL/analysis/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "fileId": "'$FILE_ID'",
    "analysisTypes": ["bug", "security", "performance", "quality"]
  }'
```

### 8. Get Analysis Results
```bash
curl -X GET $BASE_URL/analysis/$FILE_ID \
  -H "Authorization: Bearer $TOKEN"
```

### 9. Get File Details
```bash
curl -X GET $BASE_URL/files/$FILE_ID \
  -H "Authorization: Bearer $TOKEN"
```

### 10. Delete Project
```bash
curl -X DELETE $BASE_URL/projects/$PROJECT_ID \
  -H "Authorization: Bearer $TOKEN"
```

## Testing Different Code Issues

### Test File 1: Bug Detection (test-bugs.js)
```javascript
function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    if (items[i].price == null) {
      continue;
    }
    total += items[i].price;
  }
  return total;
}
```

Expected issues:
- Use of `var` instead of `let`/`const`
- Loose equality `==` instead of `===`

### Test File 2: Security Issues (test-security.js)
```javascript
function renderUserInput(input) {
  document.getElementById('output').innerHTML = input;
  eval('console.log("' + input + '")');
}

function logPassword(password) {
  console.log('User password:', password);
}
```

Expected issues:
- XSS vulnerability with `innerHTML`
- Dangerous use of `eval()`
- Logging sensitive information

### Test File 3: Performance Issues (test-performance.js)
```javascript
function processArray(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length; j++) {
      console.log(arr[i], arr[j]);
    }
  }
}
```

Expected issues:
- Inefficient nested loops
- Array length calculated repeatedly

### Test File 4: Code Quality (test-quality.js)
```javascript
// TODO: Refactor this function
function veryLongFunctionNameThatExceedsTheRecommendedLineLengthAndShouldBeBrokenIntoMultipleLinesForBetterReadability() {
  // FIXME: This is a temporary hack
  return true;
}
```

Expected issues:
- Unresolved TODO/FIXME comments
- Line length exceeds 120 characters

## Automated Testing Script

Create a file `test-api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000/api"

echo "=== Testing AI Code Review API ==="

# 1. Register
echo -e "\n1. Registering user..."
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test'$(date +%s)'@example.com","password":"test123","name":"Test User"}')
echo $REGISTER_RESPONSE | jq '.'

TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.token')
echo "Token: $TOKEN"

# 2. Create Project
echo -e "\n2. Creating project..."
PROJECT_RESPONSE=$(curl -s -X POST $BASE_URL/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Test Project","description":"Automated test"}')
echo $PROJECT_RESPONSE | jq '.'

PROJECT_ID=$(echo $PROJECT_RESPONSE | jq -r '.project.id')
echo "Project ID: $PROJECT_ID"

# 3. Upload Files
echo -e "\n3. Uploading files..."
UPLOAD_RESPONSE=$(curl -s -X POST $BASE_URL/files/upload \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "projectId": "'$PROJECT_ID'",
    "files": [
      {
        "path": "test.js",
        "content": "var x = 5;\nif (x == 5) {\n  console.log(\"test\");\n}"
      }
    ]
  }')
echo $UPLOAD_RESPONSE | jq '.'

FILE_ID=$(echo $UPLOAD_RESPONSE | jq -r '.files[0].id')
echo "File ID: $FILE_ID"

# 4. Run Analysis
echo -e "\n4. Running analysis..."
ANALYSIS_RESPONSE=$(curl -s -X POST $BASE_URL/analysis/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "fileId": "'$FILE_ID'",
    "analysisTypes": ["bug", "security", "performance", "quality"]
  }')
echo $ANALYSIS_RESPONSE | jq '.'

# 5. Get Analysis Results
echo -e "\n5. Getting analysis results..."
RESULTS_RESPONSE=$(curl -s -X GET $BASE_URL/analysis/$FILE_ID \
  -H "Authorization: Bearer $TOKEN")
echo $RESULTS_RESPONSE | jq '.'

# 6. List Projects
echo -e "\n6. Listing projects..."
LIST_RESPONSE=$(curl -s -X GET $BASE_URL/projects \
  -H "Authorization: Bearer $TOKEN")
echo $LIST_RESPONSE | jq '.'

echo -e "\n=== Testing Complete ==="
```

Make it executable:
```bash
chmod +x test-api.sh
```

Run it:
```bash
./test-api.sh
```

## Database Testing

### Check Database Contents

```bash
# Connect to PostgreSQL
psql -U user -d code_review_ai

# List all users
SELECT id, email, name, created_at FROM "User";

# List all projects
SELECT id, name, user_id, created_at FROM "Project";

# List all files
SELECT id, path, language, size FROM "File";

# List all analyses
SELECT id, type, severity, status FROM "Analysis";

# Get analysis summary
SELECT type, severity, COUNT(*) 
FROM "Analysis" 
GROUP BY type, severity;
```

## Performance Testing

### Load Testing with Apache Bench

```bash
# Test registration endpoint
ab -n 100 -c 10 -p register.json -T application/json \
  http://localhost:3000/api/auth/register

# Test login endpoint
ab -n 100 -c 10 -p login.json -T application/json \
  http://localhost:3000/api/auth/login
```

## Common Issues and Solutions

### Issue 1: Database Connection Error
**Error:** `Can't reach database server`
**Solution:** 
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify database credentials

### Issue 2: Prisma Client Not Generated
**Error:** `Cannot find module '@prisma/client'`
**Solution:**
```bash
npx prisma generate
```

### Issue 3: JWT Token Invalid
**Error:** `Unauthorized`
**Solution:**
- Check if token is expired (7 days validity)
- Ensure token is sent in Authorization header
- Verify JWT_SECRET matches between requests

### Issue 4: File Upload Fails
**Error:** `Files array is required`
**Solution:**
- Ensure files array is properly formatted
- Check file paths don't contain invalid characters
- Verify files are text files (not binary)

## Test Coverage Checklist

- [ ] User registration with valid data
- [ ] User registration with duplicate email
- [ ] User login with valid credentials
- [ ] User login with invalid credentials
- [ ] Create project with authentication
- [ ] Create project without authentication
- [ ] List projects for authenticated user
- [ ] Get project details
- [ ] Upload single file
- [ ] Upload multiple files
- [ ] Upload files with ignored patterns
- [ ] Run analysis on JavaScript file
- [ ] Run analysis on TypeScript file
- [ ] Run analysis on Python file
- [ ] Get analysis results
- [ ] Delete project
- [ ] Access unauthorized project (should fail)

## Next Steps

1. Implement unit tests with Jest
2. Add integration tests
3. Set up CI/CD pipeline
4. Add end-to-end tests with Playwright
5. Implement API rate limiting
6. Add monitoring and logging
