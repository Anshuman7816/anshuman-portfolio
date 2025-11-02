# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User
Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe" // optional
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt_token_here"
}
```

**Error Responses:**
- `400`: Missing email or password
- `409`: User already exists
- `500`: Internal server error

---

### Login User
Authenticate an existing user.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt_token_here"
}
```

**Error Responses:**
- `400`: Missing email or password
- `401`: Invalid credentials
- `500`: Internal server error

---

## Project Endpoints

### List Projects
Get all projects for the authenticated user.

**Endpoint:** `GET /api/projects`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "projects": [
    {
      "id": "uuid",
      "name": "My Project",
      "description": "Project description",
      "userId": "uuid",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "_count": {
        "files": 5
      }
    }
  ]
}
```

**Error Responses:**
- `401`: Unauthorized
- `500`: Internal server error

---

### Create Project
Create a new project.

**Endpoint:** `POST /api/projects`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "My New Project",
  "description": "Optional project description"
}
```

**Response (201):**
```json
{
  "project": {
    "id": "uuid",
    "name": "My New Project",
    "description": "Optional project description",
    "userId": "uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Missing project name
- `401`: Unauthorized
- `500`: Internal server error

---

### Get Project
Get a specific project with all its files.

**Endpoint:** `GET /api/projects/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "project": {
    "id": "uuid",
    "name": "My Project",
    "description": "Project description",
    "userId": "uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "files": [
      {
        "id": "uuid",
        "projectId": "uuid",
        "path": "src/index.js",
        "content": "console.log('Hello');",
        "language": "javascript",
        "size": 1024,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "_count": {
          "analyses": 3
        }
      }
    ]
  }
}
```

**Error Responses:**
- `401`: Unauthorized
- `404`: Project not found
- `500`: Internal server error

---

### Delete Project
Delete a project and all its files.

**Endpoint:** `DELETE /api/projects/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Project deleted successfully"
}
```

**Error Responses:**
- `401`: Unauthorized
- `404`: Project not found
- `500`: Internal server error

---

## File Endpoints

### Upload Files
Upload multiple files to a project.

**Endpoint:** `POST /api/files/upload`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "projectId": "uuid",
  "files": [
    {
      "path": "src/index.js",
      "content": "console.log('Hello World');"
    },
    {
      "path": "src/utils.js",
      "content": "export const add = (a, b) => a + b;"
    }
  ]
}
```

**Response (201):**
```json
{
  "message": "Files uploaded successfully",
  "files": [
    {
      "id": "uuid",
      "projectId": "uuid",
      "path": "src/index.js",
      "content": "console.log('Hello World');",
      "language": "javascript",
      "size": 28,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 2
}
```

**Error Responses:**
- `400`: Missing projectId or files array
- `401`: Unauthorized
- `404`: Project not found
- `500`: Internal server error

**Notes:**
- Files in `node_modules`, `.git`, `.next`, etc. are automatically ignored
- Only text files are processed
- Duplicate files (same path) are updated

---

### Get File
Get a specific file with its analysis results.

**Endpoint:** `GET /api/files/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "file": {
    "id": "uuid",
    "projectId": "uuid",
    "path": "src/index.js",
    "content": "console.log('Hello');",
    "language": "javascript",
    "size": 1024,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "analyses": [
      {
        "id": "uuid",
        "fileId": "uuid",
        "type": "bug",
        "results": "{...}",
        "severity": "medium",
        "status": "completed",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

**Error Responses:**
- `401`: Unauthorized
- `404`: File not found
- `500`: Internal server error

---

## Analysis Endpoints

### Run Analysis
Run AI code analysis on a file.

**Endpoint:** `POST /api/analysis/run`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "fileId": "uuid",
  "analysisTypes": ["bug", "security", "performance", "quality"]
}
```

**Analysis Types:**
- `bug`: Detect potential bugs and logic errors
- `security`: Find security vulnerabilities
- `performance`: Identify performance issues
- `quality`: Check code quality and best practices
- `documentation`: Suggest documentation improvements

**Response (201):**
```json
{
  "message": "Analysis completed",
  "analyses": [
    {
      "id": "uuid",
      "fileId": "uuid",
      "type": "bug",
      "results": "{...}",
      "severity": "medium",
      "status": "completed",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "summary": {
    "totalIssues": 5,
    "critical": 0,
    "high": 1,
    "medium": 2,
    "low": 2
  },
  "results": [
    {
      "type": "bug",
      "severity": "medium",
      "line": 10,
      "message": "Use strict equality (===) instead of loose equality (==)",
      "suggestion": "Replace == with === for type-safe comparison",
      "code": "if (value == null)"
    }
  ]
}
```

**Error Responses:**
- `400`: Missing fileId
- `401`: Unauthorized
- `404`: File not found
- `500`: Internal server error

---

### Get Analysis Results
Get all analysis results for a file.

**Endpoint:** `GET /api/analysis/:fileId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "analyses": [
    {
      "id": "uuid",
      "fileId": "uuid",
      "type": "bug",
      "severity": "medium",
      "status": "completed",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "results": {
        "type": "bug",
        "severity": "medium",
        "line": 10,
        "message": "Use strict equality (===) instead of loose equality (==)",
        "suggestion": "Replace == with === for type-safe comparison",
        "code": "if (value == null)"
      }
    }
  ]
}
```

**Error Responses:**
- `401`: Unauthorized
- `500`: Internal server error

---

## Example Usage with cURL

### Register and Login
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Create Project and Upload Files
```bash
# Create project
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"My Project","description":"Test project"}'

# Upload files
curl -X POST http://localhost:3000/api/files/upload \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "projectId":"PROJECT_ID",
    "files":[
      {"path":"index.js","content":"console.log(\"test\");"}
    ]
  }'
```

### Run Analysis
```bash
# Run analysis
curl -X POST http://localhost:3000/api/analysis/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "fileId":"FILE_ID",
    "analysisTypes":["bug","security","performance","quality"]
  }'

# Get analysis results
curl -X GET http://localhost:3000/api/analysis/FILE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Error Handling

All endpoints return errors in the following format:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `409`: Conflict
- `500`: Internal Server Error

---

## Rate Limiting

Currently, there are no rate limits implemented. In production, consider implementing rate limiting to prevent abuse.

## CORS

CORS is not configured by default. Configure CORS in `next.config.ts` if you need to access the API from different origins.
