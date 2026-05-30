# Setup

## Local Development

```bash
npm install
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env.local
npm run db:migrate
npm run dev
```

Set real values in the environment files before running the app.

## Creating Initial Production Data

1. Create the first Super Admin user through a controlled admin provisioning script or direct database operation approved by the deployment owner.
2. Log in as Super Admin.
3. Create real flats from `Admin > Flats`.
4. Create real association, security, and resident users for each flat.
5. Add real grocery, hotel, service, and marketplace data.

Do not use shared passwords in production.

## Useful Commands

```bash
npm run dev
npm run build:backend
npm run build:frontend
npm run db:migrate
```
