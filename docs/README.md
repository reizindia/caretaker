# Caretaker SaaS - Apartment Management Platform

Production-ready multi-tenant apartment management app built with Next.js, NestJS, PostgreSQL, and Prisma.

## Quick Start

```bash
npm install
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env.local
npm run db:migrate
npm run dev
```

After migrations, create real flats and users from the Super Admin interface or with a controlled production onboarding script.

## Required Production Data

- At least one real Super Admin user
- Real flat records with production slugs
- Real association, security, and resident users
- Real grocery, hotel, service, and marketplace data per flat

## Documentation

- [FEATURES.md](./FEATURES.md)
- [SETUP.md](./SETUP.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [SAAS_STRUCTURE.md](./SAAS_STRUCTURE.md)
