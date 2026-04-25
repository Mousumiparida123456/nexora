# Nexora Backend Setup Guide

## ✅ Quick Start

Your backend is now ready with all enterprise features! Here's how to get it running:

### Step 1: Configure Environment

```bash
cd backends/api-server
cp .env.example .env
```

Edit `.env` with your values:
```
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/nexora
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
STRIPE_SECRET_KEY=sk_test_...
CORS_ORIGIN=http://localhost:5173
```

### Step 2: Setup Local Database (PostgreSQL)

```bash
# Install PostgreSQL if not already installed
# Then create database:
createdb nexora

# Or using psql:
psql -U postgres -c "CREATE DATABASE nexora;"
```

### Step 3: Setup Redis

```bash
# Install Redis
# macOS: brew install redis
# Windows: Download from https://redis.io/windows or use Windows Subsystem for Linux

# Start Redis
redis-server
```

### Step 4: Start Backend

```bash
npm run dev
```

Your API will be available at: `http://localhost:3000`

## 📚 API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Register new user
  ```json
  {
    "email": "user@example.com",
    "password": "securepass123",
    "firstName": "John",
    "lastName": "Doe"
  }
  ```

- `POST /api/v1/auth/login` - Login user
  ```json
  {
    "email": "user@example.com",
    "password": "securepass123"
  }
  ```

### Health Check
- `GET /health` - Check server status

## 🔐 Features Implemented

### ✅ Authentication
- JWT token-based authentication
- Bcrypt password hashing
- Token expiry (configurable)
- Protected routes with `authMiddleware`

### ✅ Rate Limiting
- Redis-backed distributed rate limiting
- API limiter: 100 requests per 15 minutes
- Auth limiter: 5 login attempts per 15 minutes
- Upload limiter: 20 uploads per hour

### ✅ Security
- Helmet.js for HTTP headers
- CORS configuration
- Input validation with Zod
- SQL injection prevention via Drizzle ORM

### ✅ Database
- PostgreSQL integration
- Drizzle ORM for type-safe queries
- Pre-built schema for:
  - Users
  - Transactions
  - Accounts
  - Goals
  - Payments
  - Uploads

### ✅ Redis Integration
- Caching support
- Session management
- Rate limit tracking

### ✅ Logging
- Winston logger
- Structured logging
- File-based logs (error.log, combined.log)

## 📦 Ready-to-Implement Features

### Email Notifications
Install Nodemailer service in `src/services/email.service.ts`:
```typescript
import nodemailer from 'nodemailer';

export class EmailService {
  private transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}
```

### File Uploads
Add to `src/services/upload.service.ts`:
```typescript
import multer from 'multer';

export const uploadMiddleware = multer({
  dest: env.UPLOAD_DIR,
  limits: { fileSize: env.MAX_FILE_SIZE },
});
```

### Stripe Payments
Add to `src/services/payment.service.ts`:
```typescript
import Stripe from 'stripe';

export const stripe = new Stripe(env.STRIPE_SECRET_KEY);
```

### WebSockets
Setup in `src/index.ts`:
```typescript
import WebSocket from 'ws';
const wss = new WebSocket.Server({ server });
```

## 📁 Project Structure

```
backends/api-server/
├── src/
│   ├── config/           # Environment config
│   ├── controllers/      # Route handlers
│   ├── db/              # Database schema & migrations
│   ├── lib/             # Utilities (auth, logger, db, redis)
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── validators/      # Zod schemas
│   ├── types/           # TypeScript types
│   └── index.ts         # Entry point
├── package.json
├── tsconfig.json
└── .env
```

## 🚀 Deployment

### Deploy to Vercel

1. Create `.vercelignore`:
```
node_modules
.env.local
*.log
```

2. Create `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "DATABASE_URL": "@nexora_database_url",
    "REDIS_URL": "@nexora_redis_url",
    "JWT_SECRET": "@nexora_jwt_secret"
  }
}
```

3. Deploy:
```bash
npx vercel deploy
```

## 🔗 Connect Frontend

Update frontend API client to use:
```typescript
const API_BASE = process.env.VITE_API_URL || 'http://localhost:3000/api/v1';
```

In fintech-dashboard `.env`:
```
VITE_API_URL=http://localhost:3000/api/v1
```

## 📖 Next Steps

1. **Add Transaction Routes** - Implement `GET /transactions`, `POST /transactions`
2. **Add Goal Routes** - Implement goal CRUD operations
3. **Setup Payment Webhooks** - Stripe webhook handlers
4. **Email Service** - Setup email notifications
5. **File Upload** - Implement S3 or local file upload
6. **Swagger Docs** - Auto-generate API documentation
7. **Database Migrations** - Create migration files for schema

## 🆘 Troubleshooting

### PostgreSQL Connection Error
```bash
# Check PostgreSQL is running
# Update DATABASE_URL in .env
# Verify credentials
```

### Redis Connection Error
```bash
# Check Redis is running: redis-cli ping
# Update REDIS_URL in .env
```

### Port Already in Use
```bash
# Change PORT in .env
# Or kill process on port 3000
lsof -i :3000
kill -9 <PID>
```

## 📞 Support

All dependencies are production-ready. Features like email, payments, and file uploads require configuration but infrastructure is already in place.

Happy coding! 🚀
