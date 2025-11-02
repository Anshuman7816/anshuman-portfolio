# AI-Powered Code Review System

A comprehensive web application that uses AI to analyze code, identify bugs, security vulnerabilities, performance issues, and code quality problems.

## Features

- **User Authentication**: Secure registration and login system
- **Project Management**: Create and manage multiple code projects
- **File Upload System**: Upload entire codebases with drag-and-drop support
- **AI Code Analysis**: Multiple analysis types:
  - Bug Detection
  - Security Vulnerability Scanning
  - Performance Analysis
  - Code Quality Review
  - Documentation Suggestions
- **Interactive Dashboard**: View projects, files, and analysis results
- **RESTful API**: Complete API for integration with other tools
- **Database Storage**: Persistent storage of projects, files, and analysis results

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **AI**: OpenAI API (with mock fallback for testing)
- **Authentication**: JWT-based authentication

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd code-review-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/code_review_ai?schema=public"
OPENAI_API_KEY="your_openai_api_key_here"
JWT_SECRET="your_jwt_secret_here_change_in_production"
NEXTAUTH_SECRET="your_nextauth_secret_here_change_in_production"
NEXTAUTH_URL="http://localhost:3000"
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Build the application:
```bash
npm run build
```

6. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## API Documentation

### Authentication

#### Register
```
POST /api/auth/register
Body: { email, password, name? }
Response: { user, token }
```

#### Login
```
POST /api/auth/login
Body: { email, password }
Response: { user, token }
```

### Projects

#### List Projects
```
GET /api/projects
Headers: Authorization: Bearer <token>
Response: { projects: [] }
```

#### Create Project
```
POST /api/projects
Headers: Authorization: Bearer <token>
Body: { name, description? }
Response: { project }
```

#### Get Project
```
GET /api/projects/:id
Headers: Authorization: Bearer <token>
Response: { project }
```

#### Delete Project
```
DELETE /api/projects/:id
Headers: Authorization: Bearer <token>
Response: { message }
```

### Files

#### Upload Files
```
POST /api/files/upload
Headers: Authorization: Bearer <token>
Body: { projectId, files: [{ path, content }] }
Response: { files: [], count }
```

#### Get File
```
GET /api/files/:id
Headers: Authorization: Bearer <token>
Response: { file }
```

### Analysis

#### Run Analysis
```
POST /api/analysis/run
Headers: Authorization: Bearer <token>
Body: { fileId, analysisTypes?: [] }
Response: { analyses: [], summary, results: [] }
```

#### Get Analysis Results
```
GET /api/analysis/:fileId
Headers: Authorization: Bearer <token>
Response: { analyses: [] }
```

## Project Structure

```
/vercel/sandbox/
├── app/
│   ├── api/
│   │   ├── auth/          # Authentication endpoints
│   │   ├── projects/      # Project management endpoints
│   │   ├── files/         # File upload and retrieval
│   │   └── analysis/      # Code analysis endpoints
│   ├── dashboard/         # Dashboard page
│   ├── project/[id]/      # Project detail page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Login/Register page
├── lib/
│   ├── prisma.ts          # Prisma client
│   ├── ai-analyzer.ts     # AI analysis logic
│   ├── file-handler.ts    # File management utilities
│   └── auth.ts            # Authentication utilities
├── prisma/
│   └── schema.prisma      # Database schema
├── types/
│   └── index.ts           # TypeScript type definitions
└── uploads/               # File storage directory
```

## Database Schema

### User
- id (UUID)
- email (unique)
- name
- password (hashed)
- createdAt, updatedAt

### Project
- id (UUID)
- name
- description
- userId (foreign key)
- createdAt, updatedAt

### File
- id (UUID)
- projectId (foreign key)
- path
- content
- language
- size
- createdAt, updatedAt

### Analysis
- id (UUID)
- fileId (foreign key)
- type (bug, security, performance, quality, documentation)
- results (JSON)
- severity (low, medium, high, critical)
- status
- createdAt

## AI Analysis Types

1. **Bug Detection**: Identifies potential bugs, logic errors, and runtime issues
2. **Security Analysis**: Finds security vulnerabilities like XSS, SQL injection, etc.
3. **Performance Review**: Suggests performance improvements and optimizations
4. **Code Quality**: Checks for code smells and best practice violations
5. **Documentation**: Identifies missing or inadequate documentation

## Mock Analysis

The system includes a mock analysis feature that works without an OpenAI API key. It uses heuristic-based analysis to identify common issues:

- Loose equality operators (==)
- Use of `var` instead of `let`/`const`
- Potential XSS vulnerabilities
- Long lines and code formatting issues
- Missing documentation

## Production Deployment

1. Set up a PostgreSQL database
2. Configure environment variables
3. Run database migrations: `npx prisma migrate deploy`
4. Build the application: `npm run build`
5. Deploy to your hosting platform (Vercel, AWS, etc.)

## Security Considerations

- Always use strong JWT secrets in production
- Enable HTTPS in production
- Implement rate limiting for API endpoints
- Sanitize user inputs
- Use environment variables for sensitive data
- Regularly update dependencies

## License

MIT

## Support

For issues and questions, please open an issue on the GitHub repository.
