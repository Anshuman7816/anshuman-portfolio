# Deployment Guide

This guide covers deploying the AI Code Review System to production.

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the easiest deployment option for Next.js applications.

#### Prerequisites
- Vercel account
- PostgreSQL database (Vercel Postgres, Supabase, or other)
- OpenAI API key (optional, system works with mock analysis)

#### Steps

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Set up Environment Variables**

In your Vercel project settings, add:
```
DATABASE_URL=postgresql://user:password@host:5432/database
OPENAI_API_KEY=sk-...
JWT_SECRET=your-secure-random-string-here
NEXTAUTH_SECRET=your-secure-random-string-here
NEXTAUTH_URL=https://your-domain.vercel.app
```

4. **Deploy**
```bash
vercel
```

5. **Set up Database**
```bash
# Run migrations
npx prisma migrate deploy

# Or push schema
npx prisma db push
```

#### Vercel Configuration

Create `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

---

### Option 2: Docker Deployment

#### Dockerfile

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: code_review_ai
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://user:password@postgres:5432/code_review_ai
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      JWT_SECRET: ${JWT_SECRET}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: http://localhost:3000
    depends_on:
      - postgres
    volumes:
      - ./uploads:/app/uploads

volumes:
  postgres_data:
```

#### Deploy with Docker

```bash
# Build and start
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma migrate deploy

# View logs
docker-compose logs -f app

# Stop
docker-compose down
```

---

### Option 3: AWS Deployment

#### Using AWS Elastic Beanstalk

1. **Install EB CLI**
```bash
pip install awsebcli
```

2. **Initialize EB**
```bash
eb init -p node.js-18 code-review-ai
```

3. **Create Environment**
```bash
eb create production
```

4. **Set Environment Variables**
```bash
eb setenv DATABASE_URL=postgresql://... \
  OPENAI_API_KEY=sk-... \
  JWT_SECRET=... \
  NEXTAUTH_SECRET=... \
  NEXTAUTH_URL=https://your-domain.com
```

5. **Deploy**
```bash
eb deploy
```

#### Using AWS ECS (Fargate)

1. Build and push Docker image to ECR
2. Create ECS cluster
3. Create task definition
4. Create service
5. Set up RDS PostgreSQL database
6. Configure environment variables
7. Set up Application Load Balancer

---

### Option 4: DigitalOcean App Platform

1. **Connect Repository**
   - Go to DigitalOcean App Platform
   - Connect your GitHub/GitLab repository

2. **Configure Build**
   - Build Command: `npm run build`
   - Run Command: `npm start`

3. **Add Database**
   - Create PostgreSQL database
   - Copy connection string

4. **Set Environment Variables**
   ```
   DATABASE_URL=postgresql://...
   OPENAI_API_KEY=sk-...
   JWT_SECRET=...
   NEXTAUTH_SECRET=...
   NEXTAUTH_URL=https://your-app.ondigitalocean.app
   ```

5. **Deploy**
   - Click "Deploy"

---

## Database Setup

### PostgreSQL Providers

#### 1. Vercel Postgres
```bash
# Install
npm install @vercel/postgres

# Connection string format
DATABASE_URL="postgres://default:password@host.postgres.vercel-storage.com:5432/verceldb"
```

#### 2. Supabase
```bash
# Connection string format
DATABASE_URL="postgresql://postgres:password@db.supabase.co:5432/postgres"
```

#### 3. Railway
```bash
# Connection string format
DATABASE_URL="postgresql://postgres:password@containers-us-west-1.railway.app:5432/railway"
```

#### 4. Neon
```bash
# Connection string format
DATABASE_URL="postgresql://user:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb"
```

### Database Migrations

```bash
# Development
npx prisma migrate dev

# Production
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

---

## Environment Variables

### Required Variables

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# JWT Authentication
JWT_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="https://your-domain.com"

# Optional: OpenAI API
OPENAI_API_KEY="sk-..."
```

### Generate Secure Secrets

```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate NEXTAUTH_SECRET
openssl rand -base64 32
```

---

## Post-Deployment Checklist

- [ ] Database is accessible and migrations are applied
- [ ] Environment variables are set correctly
- [ ] HTTPS is enabled
- [ ] Domain is configured
- [ ] File uploads directory is writable
- [ ] API endpoints are accessible
- [ ] Authentication works
- [ ] File upload works
- [ ] Code analysis works
- [ ] Error logging is configured
- [ ] Monitoring is set up
- [ ] Backups are configured

---

## Security Considerations

### 1. Environment Variables
- Never commit `.env` files
- Use secure random strings for secrets
- Rotate secrets regularly

### 2. Database
- Use SSL connections in production
- Implement connection pooling
- Regular backups
- Restrict database access

### 3. API Security
- Implement rate limiting
- Add CORS configuration
- Use HTTPS only
- Validate all inputs
- Sanitize user data

### 4. File Uploads
- Limit file sizes
- Validate file types
- Scan for malicious content
- Use separate storage service

---

## Monitoring and Logging

### Vercel Analytics
```bash
npm install @vercel/analytics
```

Add to `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Error Tracking (Sentry)
```bash
npm install @sentry/nextjs
```

Initialize Sentry:
```bash
npx @sentry/wizard@latest -i nextjs
```

### Logging
Use structured logging:
```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});

logger.info('Application started');
logger.error({ err }, 'Error occurred');
```

---

## Performance Optimization

### 1. Database
- Add indexes to frequently queried fields
- Use connection pooling
- Implement caching (Redis)

### 2. API
- Implement response caching
- Use CDN for static assets
- Optimize database queries

### 3. Frontend
- Enable Next.js image optimization
- Implement code splitting
- Use lazy loading

---

## Scaling

### Horizontal Scaling
- Deploy multiple instances
- Use load balancer
- Implement session storage (Redis)

### Database Scaling
- Read replicas
- Connection pooling
- Query optimization

### File Storage
- Use S3 or similar object storage
- Implement CDN
- Compress files

---

## Backup and Recovery

### Database Backups
```bash
# Backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

### Automated Backups
- Set up daily automated backups
- Store backups in separate location
- Test restore procedures regularly

---

## Troubleshooting

### Build Fails
- Check Node.js version (18+)
- Verify all dependencies are installed
- Check for TypeScript errors

### Database Connection Issues
- Verify DATABASE_URL format
- Check database is accessible
- Verify SSL settings

### API Errors
- Check environment variables
- Verify JWT secrets
- Check logs for details

---

## Support and Maintenance

### Regular Tasks
- Update dependencies monthly
- Review and rotate secrets quarterly
- Monitor error logs daily
- Review performance metrics weekly
- Test backups monthly

### Updates
```bash
# Update dependencies
npm update

# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

---

## Cost Estimation

### Vercel + Vercel Postgres
- Hobby: Free (limited)
- Pro: $20/month + database costs

### DigitalOcean
- Basic: $5-12/month
- Database: $15/month

### AWS
- Variable based on usage
- Estimate: $20-50/month for small apps

### Database Only
- Supabase: Free tier available
- Railway: $5/month
- Neon: Free tier available
