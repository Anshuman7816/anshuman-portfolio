# AI-Powered Code Review System

A comprehensive web application that uses AI to analyze code for bugs, security vulnerabilities, performance issues, code quality, and documentation gaps.

## Features

- 📁 **File & Folder Upload**: Drag-and-drop entire codebases
- 🤖 **AI Analysis**: Multiple AI models for different analysis types
  - Bug Detection
  - Security Vulnerabilities
  - Performance Issues
  - Code Quality
  - Documentation Gaps
- 💾 **Database Storage**: PostgreSQL with Prisma ORM
- 🌳 **File Tree Navigation**: Interactive file browser
- 📊 **Analysis Dashboard**: View detailed results with suggestions
- 🔌 **RESTful API**: Complete API for integration

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **AI**: OpenAI GPT-4o-mini
- **File Storage**: Local file system with database metadata

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- OpenAI API key

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
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/code_review_ai"
OPENAI_API_KEY="your-openai-api-key"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Documentation

### Projects

#### Create Project
```http
POST /api/projects
Content-Type: application/json
x-user-id: demo-user

{
  "name": "My Project",
  "description": "Optional description"
}
```

#### Get All Projects
```http
GET /api/projects
x-user-id: demo-user
```

#### Get Project Details
```http
GET /api/projects/{id}
```

#### Delete Project
```http
DELETE /api/projects/{id}
```

### Files

#### Upload Files
```http
POST /api/files/upload
Content-Type: application/json
x-user-id: demo-user

{
  "projectId": "project-id",
  "files": [
    {
      "path": "src/index.js",
      "content": "console.log('Hello');"
    }
  ]
}
```

#### Get File Details
```http
GET /api/files/{id}
```

#### Delete File
```http
DELETE /api/files/{id}
```

### Analysis

#### Run Analysis
```http
POST /api/analysis/run
Content-Type: application/json

{
  "fileId": "file-id",
  "analysisTypes": ["bug", "security", "performance", "quality", "documentation"]
}
```

#### Get Analysis Results
```http
GET /api/analysis/{id}
```

#### Get Project Analysis Summary
```http
GET /api/analysis/project/{projectId}
```

## Analysis Types

### 1. Bug Detection
Identifies potential bugs, logic errors, edge cases, and runtime issues.

### 2. Security Analysis
Finds security vulnerabilities including:
- SQL injection
- XSS vulnerabilities
- CSRF issues
- Insecure dependencies
- Hardcoded secrets
- Authentication problems

### 3. Performance Analysis
Identifies performance issues:
- Inefficient algorithms
- Memory leaks
- Unnecessary computations
- Blocking operations

### 4. Code Quality
Checks for:
- Code smells
- Best practice violations
- Maintainability issues
- Naming conventions
- Code duplication

### 5. Documentation
Identifies missing or inadequate:
- Function/class descriptions
- Parameter descriptions
- Code comments

## Database Schema

### User
- id (String, Primary Key)
- email (String, Unique)
- name (String, Optional)
- password (String)
- projects (Relation)

### Project
- id (String, Primary Key)
- name (String)
- description (String, Optional)
- userId (String, Foreign Key)
- files (Relation)

### File
- id (String, Primary Key)
- projectId (String, Foreign Key)
- path (String)
- content (Text)
- language (String, Optional)
- size (Integer)
- analyses (Relation)

### Analysis
- id (String, Primary Key)
- fileId (String, Foreign Key)
- type (String: bug, security, performance, quality, documentation)
- results (JSON Text)
- severity (String: low, medium, high, critical)
- status (String: pending, completed, failed)

## Project Structure

```
/vercel/sandbox/
├── app/
│   ├── api/
│   │   ├── projects/
│   │   ├── files/
│   │   └── analysis/
│   ├── project/[id]/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── FileUploader.tsx
│   ├── FileTree.tsx
│   ├── CodeViewer.tsx
│   └── AnalysisResults.tsx
├── lib/
│   ├── prisma.ts
│   ├── ai-analyzer.ts
│   ├── file-handler.ts
│   └── types.ts
├── prisma/
│   └── schema.prisma
└── public/
```

## Usage Example

1. **Create a Project**: Click "New Project" on the home page
2. **Upload Files**: Drag and drop your codebase or select files
3. **Select a File**: Click on any file in the file tree
4. **Run Analysis**: Click the "Analyze" button
5. **View Results**: See detailed analysis with suggestions and code snippets

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.
