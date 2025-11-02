# Architecture Documentation

## System Overview

The AI Code Review System is a full-stack web application built with Next.js that leverages AI to analyze code for various issues including bugs, security vulnerabilities, performance problems, code quality issues, and documentation gaps.

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom React components
- **State Management**: React Hooks (useState, useEffect)

### Backend
- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **Language**: TypeScript
- **Database ORM**: Prisma
- **Database**: PostgreSQL

### AI/ML
- **Provider**: OpenAI
- **Model**: GPT-4o-mini
- **Analysis Types**: 5 specialized analyzers

### File Storage
- **Primary**: Local file system
- **Metadata**: PostgreSQL database
- **Structure**: Project-based directory organization

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Browser    │  │  Mobile Web  │  │  API Client  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Application                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Frontend (React Components)              │  │
│  │  • FileUploader  • FileTree  • CodeViewer            │  │
│  │  • AnalysisResults  • Dashboard                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  API Routes Layer                     │  │
│  │  • /api/projects     • /api/files                    │  │
│  │  • /api/analysis     • /api/auth                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   Prisma     │   │ AI Analyzer  │   │File Handler  │
│   Client     │   │   Module     │   │   Module     │
└──────────────┘   └──────────────┘   └──────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  PostgreSQL  │   │  OpenAI API  │   │ File System  │
│   Database   │   │              │   │   Storage    │
└──────────────┘   └──────────────┘   └──────────────┘
```

## Component Architecture

### Frontend Components

#### 1. FileUploader
**Purpose**: Handle file and folder uploads via drag-and-drop or file selection

**Features**:
- Drag-and-drop interface
- Recursive folder processing
- File reading and content extraction
- Upload progress tracking
- Error handling

**Props**:
- `projectId`: Target project ID
- `onUploadComplete`: Callback after successful upload

#### 2. FileTree
**Purpose**: Display project files in a hierarchical tree structure

**Features**:
- Collapsible folder navigation
- File selection
- Analysis count badges
- Recursive tree building

**Props**:
- `files`: Array of file nodes
- `onFileSelect`: File selection callback
- `selectedFileId`: Currently selected file

#### 3. CodeViewer
**Purpose**: Display code with syntax highlighting and line numbers

**Features**:
- Line-by-line display
- Line highlighting
- Copy to clipboard
- Scrollable view

**Props**:
- `code`: Source code content
- `language`: Programming language
- `highlightLines`: Lines to highlight

#### 4. AnalysisResults
**Purpose**: Display AI analysis results with detailed findings

**Features**:
- Grouped by analysis type
- Severity indicators
- Clickable line numbers
- Suggestions and code snippets
- Color-coded severity levels

**Props**:
- `analyses`: Array of analysis results
- `onLineClick`: Line click callback

### Backend Modules

#### 1. AI Analyzer (`lib/ai-analyzer.ts`)

**Purpose**: Interface with OpenAI API for code analysis

**Methods**:
- `analyzeBugs()`: Detect potential bugs and logic errors
- `analyzeSecurity()`: Find security vulnerabilities
- `analyzePerformance()`: Identify performance issues
- `analyzeQuality()`: Check code quality and best practices
- `analyzeDocumentation()`: Find documentation gaps
- `analyzeAll()`: Run all analyses in parallel

**AI Prompts**:
Each analysis type uses specialized system prompts to guide the AI:
- Bug Detection: Focus on logic errors, edge cases, runtime issues
- Security: SQL injection, XSS, CSRF, secrets exposure
- Performance: Algorithm efficiency, memory leaks, blocking operations
- Quality: Code smells, best practices, maintainability
- Documentation: Missing comments, unclear descriptions

#### 2. File Handler (`lib/file-handler.ts`)

**Purpose**: Manage file system operations

**Methods**:
- `ensureUploadDir()`: Create upload directory if needed
- `saveFile()`: Save file to disk
- `readFile()`: Read file content
- `deleteProject()`: Remove project files
- `getFileLanguage()`: Detect programming language
- `shouldAnalyzeFile()`: Check if file type is analyzable
- `getProjectFiles()`: List all project files

#### 3. Prisma Client (`lib/prisma.ts`)

**Purpose**: Database connection management

**Features**:
- Singleton pattern for connection pooling
- Development mode hot reload support
- Type-safe database queries

## Database Schema

### Entity Relationship Diagram

```
┌─────────────┐
│    User     │
├─────────────┤
│ id          │◄─────┐
│ email       │      │
│ name        │      │
│ password    │      │
│ createdAt   │      │
│ updatedAt   │      │
└─────────────┘      │
                     │ 1:N
                     │
┌─────────────┐      │
│   Project   │      │
├─────────────┤      │
│ id          │──────┘
│ name        │
│ description │
│ userId      │◄─────┐
│ createdAt   │      │
│ updatedAt   │      │
└─────────────┘      │
                     │ 1:N
                     │
┌─────────────┐      │
│    File     │      │
├─────────────┤      │
│ id          │──────┘
│ projectId   │
│ path        │
│ content     │
│ language    │
│ size        │◄─────┐
│ createdAt   │      │
│ updatedAt   │      │
└─────────────┘      │
                     │ 1:N
                     │
┌─────────────┐      │
│  Analysis   │      │
├─────────────┤      │
│ id          │──────┘
│ fileId      │
│ type        │
│ results     │
│ severity    │
│ status      │
│ createdAt   │
└─────────────┘
```

### Table Descriptions

#### User
Stores user account information
- Primary authentication entity
- One-to-many relationship with Projects

#### Project
Represents a code project/repository
- Contains multiple files
- Belongs to a user
- Soft delete cascades to files

#### File
Stores individual file metadata and content
- Unique constraint on (projectId, path)
- Contains full file content as text
- Tracks file size and language

#### Analysis
Stores AI analysis results
- Multiple analyses per file (one per type)
- Results stored as JSON
- Tracks severity and status

## API Architecture

### RESTful Endpoints

#### Projects API
```
POST   /api/projects          - Create project
GET    /api/projects          - List user projects
GET    /api/projects/[id]     - Get project details
DELETE /api/projects/[id]     - Delete project
```

#### Files API
```
POST   /api/files/upload      - Upload files
GET    /api/files/[id]        - Get file details
DELETE /api/files/[id]        - Delete file
```

#### Analysis API
```
POST   /api/analysis/run                    - Run analysis
GET    /api/analysis/[id]                   - Get analysis result
GET    /api/analysis/project/[projectId]   - Get project summary
```

### Request/Response Flow

1. **Client Request** → Next.js API Route
2. **Validation** → Check required parameters
3. **Authentication** → Verify user (x-user-id header)
4. **Business Logic** → Process request
5. **Database Query** → Prisma operations
6. **Response** → JSON with success/error

### Error Handling

All API routes follow consistent error response format:
```json
{
  "success": false,
  "error": "Error message"
}
```

HTTP Status Codes:
- 200: Success
- 400: Bad Request (validation error)
- 404: Not Found
- 500: Internal Server Error

## Data Flow

### File Upload Flow

```
User selects files
      │
      ▼
FileUploader processes files
      │
      ├─ Read file content
      ├─ Extract metadata
      └─ Build file array
      │
      ▼
POST /api/files/upload
      │
      ├─ Validate project exists
      ├─ Save to file system
      └─ Save metadata to database
      │
      ▼
Return file IDs
```

### Analysis Flow

```
User clicks "Analyze"
      │
      ▼
POST /api/analysis/run
      │
      ├─ Fetch file content
      ├─ Check file type
      └─ For each analysis type:
          │
          ├─ Build AI prompt
          ├─ Call OpenAI API
          ├─ Parse results
          ├─ Determine severity
          └─ Save to database
      │
      ▼
Return analysis results
```

## Security Architecture

### Authentication
- User identification via x-user-id header
- Demo mode for testing
- NextAuth.js ready for production auth

### Data Validation
- Input sanitization on all API routes
- File type validation
- Size limits on uploads
- SQL injection prevention via Prisma

### API Security
- CORS configuration
- Rate limiting (recommended for production)
- Environment variable protection
- No sensitive data in responses

## Performance Considerations

### Database
- Indexed foreign keys
- Efficient queries with Prisma
- Connection pooling
- Cascading deletes

### File Storage
- Organized by project ID
- Metadata cached in database
- Lazy loading of file content

### AI Analysis
- Parallel analysis execution
- Streaming responses (future enhancement)
- Result caching in database
- Configurable analysis types

### Frontend
- Code splitting via Next.js
- Lazy component loading
- Optimized re-renders
- Virtual scrolling for large files (future)

## Scalability

### Horizontal Scaling
- Stateless API design
- Database connection pooling
- Shared file storage (S3 recommended)

### Vertical Scaling
- Efficient database queries
- Optimized AI prompts
- Caching strategies

### Future Enhancements
- Redis for session management
- Queue system for analysis jobs
- CDN for static assets
- Read replicas for database

## Monitoring & Logging

### Application Logs
- API request/response logging
- Error tracking
- Performance metrics

### Database Monitoring
- Query performance
- Connection pool status
- Storage usage

### AI Usage Tracking
- API call counts
- Token usage
- Cost monitoring

## Development Workflow

### Local Development
1. Clone repository
2. Install dependencies
3. Set up environment variables
4. Initialize database
5. Run development server

### Testing
- TypeScript type checking
- ESLint for code quality
- API endpoint testing
- Manual UI testing

### Deployment
- Build verification
- Database migration
- Environment configuration
- Production deployment

## Best Practices

### Code Organization
- Modular component structure
- Separation of concerns
- Type safety with TypeScript
- Consistent naming conventions

### Database
- Use transactions for related operations
- Index frequently queried fields
- Regular backups
- Migration versioning

### API Design
- RESTful conventions
- Consistent response format
- Proper HTTP status codes
- Comprehensive error messages

### Security
- Environment variables for secrets
- Input validation
- SQL injection prevention
- XSS protection

## Future Roadmap

### Phase 1 (Current)
- ✅ Basic file upload
- ✅ AI analysis (5 types)
- ✅ Project management
- ✅ File tree navigation

### Phase 2 (Planned)
- [ ] User authentication
- [ ] Real-time analysis
- [ ] Batch processing
- [ ] Analysis history

### Phase 3 (Future)
- [ ] Team collaboration
- [ ] Custom analysis rules
- [ ] Integration with Git
- [ ] CI/CD pipeline integration

### Phase 4 (Advanced)
- [ ] Machine learning models
- [ ] Custom AI training
- [ ] Advanced reporting
- [ ] Enterprise features
