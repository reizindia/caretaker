# Caretaker SaaS — Apartment Management Platform

> Smart, multi-tenant SaaS web application for apartment management built with Next.js 14 + NestJS + PostgreSQL.

## Overview

Caretaker is a fully web-based Progressive Web App (PWA) that enables apartment complexes to manage residents, grocery orders, food orders, service bookings, and gate passes — all from a single platform accessible on any device.

Each apartment is an independent **tenant** with its own subdomain (e.g., `abc.caretakerapp.com`). The platform supports multiple apartments under one deployment, making it a true SaaS product.

---

## Key Features

- **Resident Web App** — Grocery ordering, food ordering, service booking, gate pass requests
- **Security Dashboard** — Gate pass approval, visitor entry/exit tracking
- **Flat Association Portal** — Order management, resident management, reports
- **Super Admin Portal** — Full platform control, all flats, all modules, documentation

---

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm 9+

### Development Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd care_taker

# 2. Install all dependencies
npm install

# 3. Set up environment variables
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env.local

# 4. Edit environment files with your values
# Minimum: DATABASE_URL, JWT_SECRET

# 5. Run database migrations
cd apps/backend
npx prisma migrate dev --name init

# 6. Seed demo data
npm run db:seed

# 7. Start development servers
cd ../..
npm run dev
```

### Development URLs

| Access | URL |
|--------|-----|
| Super Admin | `http://localhost:3000/admin/dashboard` |
| ABC Apartment | `http://abc.localhost:3000` or `http://localhost:3000?tenant=abc` |
| Green View Apartment | `http://greenview.localhost:3000` or `http://localhost:3000?tenant=greenview` |
| Backend API | `http://localhost:3001/api` |

---

## Demo Credentials

All accounts use password: `password123`

| Role | Email | Flat |
|------|-------|------|
| Super Admin | admin@caretaker.com | All Flats |
| Resident | resident@abc.com | ABC Apartment |
| Security | security@abc.com | ABC Apartment |
| Association | association@abc.com | ABC Apartment |
| Resident | resident@greenview.com | Green View |
| Security | security@greenview.com | Green View |
| Association | association@greenview.com | Green View |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS |
| Backend | NestJS, Node.js, TypeScript |
| Database | PostgreSQL with Prisma ORM |
| Auth | JWT + Role-Based Access Control |
| State | Zustand + TanStack React Query |
| PWA | next-pwa, Web App Manifest |
| Storage | Cloudflare R2 / AWS S3 compatible |
| Deployment | Docker + VPS / Coolify |

---

## Project Cost

- **Development**: ₹70,000 (one-time)
- **Maintenance**: ₹7,000 per 3 months

---

## Documentation

- [FEATURES.md](./FEATURES.md) — Complete feature list per role
- [SETUP.md](./SETUP.md) — Detailed local development setup
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Production deployment guide
- [SAAS_STRUCTURE.md](./SAAS_STRUCTURE.md) — Multi-tenant architecture

---

*Built by Reizindia Tech Solutions*
