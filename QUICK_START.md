# Quick Start Guide

Get the AI Code Review System up and running in 5 minutes!

## Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- npm or yarn

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/code_review_ai?schema=public"

# OpenAI API (Optional - system works without it)
OPENAI_API_KEY="your_openai_api_key_here"

# JWT Secrets (Generate with: openssl rand -base64 32)
JWT_SECRET="your_jwt_secret_here_change_in_production"
NEXTAUTH_SECRET="your_nextauth_secret_here_change_in_production"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Set Up Database

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma db push
```

### 4. Build the Application

```bash
npm run build
```

### 5. Start the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## First Steps

### 1. Create an Account
- Navigate to `http://localhost:3000`
- Click on "Register" tab
- Enter your email, password, and name
- Click "Register"

### 2. Create a Project
- You'll be redirected to the dashboard
- Click "New Project"
- Enter project name and description
- Click "Create"

### 3. Upload Files
- Click on your project
- Click "Upload Files"
- Select code files from your computer
- Files will be uploaded and displayed in the sidebar

### 4. Analyze Code
- Click on a file in the sidebar
- Click "Run Analysis"
- Wait a few seconds for analysis to complete
- View results below the code viewer

## Testing with Sample File

A sample file with various code issues is included: `sample-code-for-testing.js`

Upload this file to see how the analysis works:
- Bug detection (var usage, loose equality)
- Security issues (XSS, eval, password logging)
- Performance problems (nested loops)
- Code quality issues (long lines, TODO comments)
- Missing documentation

## API Testing

### Get a Token
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'

# Save the token from the response
TOKEN="your_token_here"
```

### Create a Project
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Test Project","description":"My first project"}'

# Save the project ID
PROJECT_ID="your_project_id"
```

### Upload a File
```bash
curl -X POST http://localhost:3000/api/files/upload \
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
  }'

# Save the file ID
FILE_ID="your_file_id"
```

### Run Analysis
```bash
curl -X POST http://localhost:3000/api/analysis/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "fileId": "'$FILE_ID'",
    "analysisTypes": ["bug", "security", "performance", "quality"]
  }'
```

## Troubleshooting

### Database Connection Error
**Problem**: Can't connect to database

**Solution**:
1. Ensure PostgreSQL is running
2. Check DATABASE_URL in .env
3. Verify database credentials
4. Create database if it doesn't exist:
   ```bash
   createdb code_review_ai
   ```

### Prisma Client Error
**Problem**: Cannot find module '@prisma/client'

**Solution**:
```bash
npx prisma generate
```

### Build Errors
**Problem**: TypeScript or build errors

**Solution**:
1. Delete .next folder: `rm -rf .next`
2. Clear node_modules: `rm -rf node_modules`
3. Reinstall: `npm install`
4. Rebuild: `npm run build`

### Port Already in Use
**Problem**: Port 3000 is already in use

**Solution**:
```bash
# Use a different port
PORT=3001 npm run dev
```

## Next Steps

1. **Read the Documentation**
   - `README.md` - Overview and features
   - `API_DOCUMENTATION.md` - Complete API reference
   - `TESTING_GUIDE.md` - Detailed testing procedures
   - `DEPLOYMENT.md` - Production deployment guide

2. **Explore Features**
   - Upload different file types
   - Try different analysis types
   - Create multiple projects
   - Test the API endpoints

3. **Customize**
   - Add custom analysis rules
   - Modify the UI
   - Extend the API
   - Add new features

4. **Deploy**
   - Follow DEPLOYMENT.md
   - Set up production database
   - Configure environment variables
   - Deploy to Vercel, AWS, or DigitalOcean

## Support

For issues or questions:
1. Check the documentation files
2. Review the error logs
3. Test with the sample file
4. Check the TESTING_GUIDE.md

## Features Overview

✅ User authentication and authorization
✅ Project management
✅ File upload system
✅ AI-powered code analysis (5 types)
✅ Interactive dashboard
✅ RESTful API
✅ PostgreSQL database
✅ TypeScript support
✅ Responsive design
✅ Mock analysis (works without OpenAI API)

## System Requirements

- **Node.js**: 18.0.0 or higher
- **PostgreSQL**: 12.0 or higher
- **RAM**: 512MB minimum
- **Disk**: 1GB minimum
- **Browser**: Modern browser (Chrome, Firefox, Safari, Edge)

## Performance Tips

1. **Database**: Use connection pooling in production
2. **Files**: Limit file sizes to 1MB per file
3. **Analysis**: Run analysis on smaller files first
4. **Caching**: Consider adding Redis for caching

## Security Notes

⚠️ **Important**: 
- Change JWT_SECRET and NEXTAUTH_SECRET in production
- Use strong passwords
- Enable HTTPS in production
- Keep dependencies updated
- Don't commit .env files

## License

MIT License - Free to use and modify

---

**Ready to start?** Run `npm run dev` and visit `http://localhost:3000`! 🚀
