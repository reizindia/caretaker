# Caretaker SaaS — Local Development Setup

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 18+ | Use nvm for version management |
| npm | 9+ | Comes with Node.js |
| PostgreSQL | 14+ | Local install or Docker |
| Git | Any | For version control |

---

## Step 1: Clone and Install

```bash
git clone <repository-url>
cd care_taker

# Install all workspace dependencies (root + backend + frontend)
npm install
```

---

## Step 2: Set Up Environment Variables

### Backend

```bash
cp apps/backend/.env.example apps/backend/.env
```

Edit `apps/backend/.env`:

```env
# Database — adjust host/user/password/dbname as needed
DATABASE_URL="postgresql://postgres:password@localhost:5432/caretaker_db"

# JWT — change to a strong random secret in production
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRY="7d"

# App
PORT=3001
NODE_ENV=development

# Storage (optional — for image upload)
STORAGE_ENDPOINT="https://<account-id>.r2.cloudflarestorage.com"
STORAGE_REGION="auto"
STORAGE_ACCESS_KEY_ID="your-access-key"
STORAGE_SECRET_ACCESS_KEY="your-secret-key"
STORAGE_BUCKET_NAME="caretaker"
STORAGE_PUBLIC_URL="https://pub-<hash>.r2.dev"
```

### Frontend

```bash
cp apps/frontend/.env.example apps/frontend/.env.local
```

Edit `apps/frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_DOMAIN=localhost:3000
NEXT_PUBLIC_APP_NAME=Caretaker
```

---

## Step 3: Create the Database

```bash
# Using psql
createdb caretaker_db

# Or connect to psql and run:
# CREATE DATABASE caretaker_db;
```

---

## Step 4: Run Migrations

```bash
cd apps/backend
npx prisma migrate dev --name init
```

This creates all tables based on `prisma/schema.prisma`.

---

## Step 5: Seed Demo Data

```bash
# Still inside apps/backend
npm run db:seed
```

This creates:
- 2 demo flats (ABC Apartment, Green View Apartment)
- 1 Super Admin + 6 flat users (2 per role per flat)
- 8 grocery items per flat
- 2 hotels per flat with 4 food items each
- 6 services per flat with time slots for the next 7 days

---

## Step 6: Start Development Servers

From the root directory:

```bash
npm run dev
```

This starts both backend (port 3001) and frontend (port 3000) concurrently.

Or start individually:

```bash
# Backend only
cd apps/backend
npm run start:dev

# Frontend only
cd apps/frontend
npm run dev
```

---

## Accessing the Application

### Super Admin

URL: `http://localhost:3000/admin/dashboard`

Login: `admin@caretaker.com` / `password123`

No tenant detection needed for Super Admin.

### Tenant Residents / Security / Association

**Option 1 — Query parameter (easiest for local dev):**

```
http://localhost:3000?tenant=abc
http://localhost:3000?tenant=greenview
```

After the middleware sets the `tenant-slug` cookie, navigate normally.

**Option 2 — Subdomain (requires hosts file edit):**

Edit your hosts file:

```
# Windows: C:\Windows\System32\drivers\etc\hosts
# Mac/Linux: /etc/hosts

127.0.0.1  abc.localhost
127.0.0.1  greenview.localhost
```

Then access:
```
http://abc.localhost:3000
http://greenview.localhost:3000
```

---

## Demo Login Credentials

Password for all accounts: `password123`

| Role | Email | Flat |
|------|-------|------|
| Super Admin | admin@caretaker.com | — |
| Resident | resident@abc.com | ABC Apartment |
| Security | security@abc.com | ABC Apartment |
| Association | association@abc.com | ABC Apartment |
| Resident | resident@greenview.com | Green View |
| Security | security@greenview.com | Green View |
| Association | association@greenview.com | Green View |

---

## Useful Commands

```bash
# Root
npm run dev                    # Start all services
npm install                    # Install all workspace deps

# Backend
cd apps/backend
npm run start:dev              # Development with hot reload
npm run build                  # Production build
npx prisma studio              # Visual DB browser (localhost:5555)
npx prisma migrate dev         # Run migrations
npx prisma migrate reset       # Reset DB and re-seed
npm run db:seed                # Seed data only

# Frontend
cd apps/frontend
npm run dev                    # Development server
npm run build                  # Production build
npm run lint                   # ESLint check
```

---

## Project Structure

```
care_taker/
├── apps/
│   ├── backend/
│   │   ├── prisma/
│   │   │   ├── schema.prisma      # Database schema
│   │   │   └── seed.ts            # Demo data seeder
│   │   ├── src/
│   │   │   ├── common/            # Guards, middleware, decorators
│   │   │   ├── modules/           # Feature modules
│   │   │   └── prisma/            # PrismaService
│   │   └── .env                   # Backend env vars
│   └── frontend/
│       ├── public/
│       │   ├── manifest.json      # PWA manifest
│       │   └── icons/             # App icons
│       ├── src/
│       │   ├── app/               # Next.js App Router pages
│       │   ├── components/        # Shared UI components
│       │   └── lib/               # Hooks, stores, API client
│       └── .env.local             # Frontend env vars
└── docs/                          # Documentation
```

---

## Troubleshooting

### "Cannot connect to database"
- Check `DATABASE_URL` in `apps/backend/.env`
- Ensure PostgreSQL is running: `pg_isready`
- Create the database if it doesn't exist: `createdb caretaker_db`

### "Tenant not found" on login
- Make sure you've run `npm run db:seed`
- Use `?tenant=abc` in the URL before navigating to login
- Check that the `tenant-slug` cookie is set in browser DevTools

### Port already in use
- Backend runs on 3001, frontend on 3000
- Kill existing processes: `npx kill-port 3000 3001`

### Prisma migration errors
- Run `npx prisma migrate reset` to reset and re-apply all migrations
- Check that PostgreSQL version is 14+
