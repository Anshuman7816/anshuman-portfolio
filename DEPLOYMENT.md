# Deployment Guide - AI Code Review System

This guide covers deploying the AI Code Review System to various platforms.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- OpenAI API key
- Git repository (for deployment platforms)

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# NextAuth
NEXTAUTH_SECRET="generate-a-secure-random-string"
NEXTAUTH_URL="https://your-domain.com"

# OpenAI API
OPENAI_API_KEY="sk-your-openai-api-key"

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR="./uploads"
```

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Deployment Options

### 1. Vercel (Recommended)

Vercel is the easiest deployment option for Next.js applications.

#### Steps:

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Set up PostgreSQL:**
   - Use Vercel Postgres, Supabase, or any PostgreSQL provider
   - Get your connection string

3. **Deploy:**
```bash
vercel
```

4. **Configure Environment Variables:**
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add all required environment variables:
     - `DATABASE_URL`
     - `OPENAI_API_KEY`
     - `NEXTAUTH_SECRET`
     - `NEXTAUTH_URL`

5. **Run Database Migrations:**
```bash
vercel env pull .env.local
npx prisma generate
npx prisma db push
```

6. **Redeploy:**
```bash
vercel --prod
```

#### Vercel Postgres Setup:

```bash
# Install Vercel Postgres
vercel postgres create

# Link to your project
vercel link

# Pull environment variables
vercel env pull .env.local
```

### 2. Docker Deployment

#### Dockerfile:

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
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### docker-compose.yml:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: codereviewer
      POSTGRES_PASSWORD: secure_password
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
      DATABASE_URL: postgresql://codereviewer:secure_password@postgres:5432/code_review_ai
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: http://localhost:3000
    depends_on:
      - postgres
    volumes:
      - ./uploads:/app/uploads

volumes:
  postgres_data:
```

#### Deploy with Docker:

```bash
# Build and run
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma db push

# View logs
docker-compose logs -f app
```

### 3. AWS Deployment

#### Using AWS Elastic Beanstalk:

1. **Install EB CLI:**
```bash
pip install awsebcli
```

2. **Initialize:**
```bash
eb init -p node.js-18 code-review-ai
```

3. **Create environment:**
```bash
eb create code-review-ai-env
```

4. **Set environment variables:**
```bash
eb setenv DATABASE_URL="your-db-url" \
  OPENAI_API_KEY="your-key" \
  NEXTAUTH_SECRET="your-secret" \
  NEXTAUTH_URL="https://your-domain.com"
```

5. **Deploy:**
```bash
eb deploy
```

#### Using AWS ECS (Fargate):

1. Build and push Docker image to ECR
2. Create ECS cluster
3. Create task definition with environment variables
4. Create service with load balancer
5. Set up RDS PostgreSQL instance

### 4. Railway

Railway provides easy deployment with built-in PostgreSQL.

1. **Install Railway CLI:**
```bash
npm install -g @railway/cli
```

2. **Login:**
```bash
railway login
```

3. **Initialize:**
```bash
railway init
```

4. **Add PostgreSQL:**
```bash
railway add postgresql
```

5. **Set environment variables:**
```bash
railway variables set OPENAI_API_KEY="your-key"
railway variables set NEXTAUTH_SECRET="your-secret"
```

6. **Deploy:**
```bash
railway up
```

### 5. DigitalOcean App Platform

1. Connect your GitHub repository
2. Select Node.js as the environment
3. Add PostgreSQL database
4. Configure environment variables
5. Deploy

## Database Setup

### PostgreSQL Cloud Providers:

1. **Supabase** (Free tier available)
   - Sign up at supabase.com
   - Create new project
   - Get connection string from Settings → Database

2. **Neon** (Serverless Postgres)
   - Sign up at neon.tech
   - Create project
   - Copy connection string

3. **Railway** (Built-in)
   - Automatically provisioned with Railway deployment

4. **AWS RDS**
   - Create PostgreSQL instance
   - Configure security groups
   - Get connection string

### Running Migrations:

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Or use migrations
npx prisma migrate deploy
```

## Post-Deployment

### 1. Verify Deployment:

```bash
# Test API endpoints
curl https://your-domain.com/api/projects

# Check health
curl https://your-domain.com/
```

### 2. Monitor Logs:

- Vercel: Check deployment logs in dashboard
- Docker: `docker-compose logs -f`
- AWS: CloudWatch logs
- Railway: Built-in logs viewer

### 3. Set Up Monitoring:

- Configure error tracking (Sentry, LogRocket)
- Set up uptime monitoring
- Monitor database performance
- Track API usage

## Scaling Considerations

### Database:

- Use connection pooling (PgBouncer)
- Enable read replicas for heavy read workloads
- Regular backups and point-in-time recovery

### Application:

- Enable Next.js caching
- Use CDN for static assets
- Implement rate limiting
- Consider Redis for session storage

### File Storage:

- For production, use S3 or similar object storage
- Implement file size limits
- Add virus scanning for uploaded files

## Security Checklist

- [ ] Use strong `NEXTAUTH_SECRET`
- [ ] Enable HTTPS only
- [ ] Set up CORS properly
- [ ] Implement rate limiting
- [ ] Use environment variables for secrets
- [ ] Enable database SSL
- [ ] Regular security updates
- [ ] Implement proper authentication
- [ ] Add input validation
- [ ] Enable CSP headers

## Troubleshooting

### Database Connection Issues:

```bash
# Test connection
npx prisma db pull

# Check connection string format
# postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA
```

### Build Failures:

```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Prisma Issues:

```bash
# Regenerate client
npx prisma generate

# Reset database (development only)
npx prisma migrate reset
```

## Support

For issues and questions:
- Check the README.md
- Review API documentation
- Open an issue on GitHub
- Check deployment platform documentation

## License

MIT License
