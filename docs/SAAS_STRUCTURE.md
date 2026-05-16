# Caretaker SaaS — Multi-Tenant Architecture

## Overview

Caretaker uses a **single-database, subdomain-per-tenant** multi-tenancy model. Every apartment (tenant) shares the same database and application code, but all data is isolated at the row level using a `flatId` foreign key on every tenant-specific table.

---

## Tenant Identification

### Production

```
https://abc.caretakerapp.com
         ↑
     tenant slug
```

The subdomain `abc` is the tenant slug. The Next.js middleware and NestJS backend both read this to identify the tenant.

### Local Development

```
http://abc.localhost:3000        ← Subdomain (requires hosts file)
http://localhost:3000?tenant=abc ← Query param (no hosts file needed)
```

---

## Request Flow (Full Stack)

```
Browser Request
  ↓
Next.js Middleware (apps/frontend/src/middleware.ts)
  → Extract slug from host: abc.caretakerapp.com → "abc"
  → Fallback: ?tenant=abc query param
  → Validate: GET /api/tenant/by-slug/abc
  → If not found: redirect to /not-found-flat
  → If inactive: redirect to /inactive-flat
  → Set cookie: tenant-slug=abc
  → Continue to page
  ↓
Next.js Page (React)
  → Reads tenant-slug cookie
  → Axios client injects: Authorization: Bearer <jwt>
  → Axios client injects: X-Tenant-Slug: abc
  ↓
NestJS Backend (apps/backend)
  → TenantMiddleware reads X-Tenant-Slug header
  → Looks up Flat where slug = "abc"
  → If not found: 404
  → If inactive: 403
  → Attaches to request: req.tenantFlatId = flat.id
  ↓
JwtAuthGuard
  → Validates Bearer token
  → Fetches user from DB, checks isActive
  → Attaches user to request
  ↓
RolesGuard
  → Checks @Roles() decorator on route
  → Throws 403 if role doesn't match
  ↓
FlatIsolationGuard
  → SUPER_ADMIN: pass through (can access all flats)
  → Others: user.flatId must equal req.tenantFlatId
  → Throws 403 if mismatch (cross-tenant access attempt)
  ↓
Service Layer
  → All Prisma queries include: where: { flatId: req.tenantFlatId }
  → SUPER_ADMIN queries accept optional flatId filter
  ↓
Database (PostgreSQL)
  → Row-level isolation via flatId column
```

---

## Database Schema Design

### Flat (Tenant)

```prisma
model Flat {
  id            String     @id @default(cuid())
  name          String     // "ABC Apartment"
  slug          String     @unique // "abc"
  subdomain     String     // "abc.caretakerapp.com"
  status        FlatStatus @default(ACTIVE)
  themeColor    String     @default("#3B82F6")
  // ... other fields
}
```

### Every Tenant Table Has flatId

```prisma
model GroceryItem {
  id     String @id @default(cuid())
  flatId String          // ← Tenant isolation key
  flat   Flat   @relation(...)
  name   String
  price  Float
  // ...
}
```

Tables with `flatId`: `User`, `GroceryItem`, `GroceryOrder`, `UnavailableItemRequest`, `Hotel`, `FoodOrder`, `Service`, `TimeSlot`, `ServiceBooking`, `GatePass`

### SUPER_ADMIN Has No flatId

```prisma
model User {
  id     String  @id
  flatId String? // nullable — SUPER_ADMIN has no flat
  role   Role
  // ...
}
```

---

## Tenant Isolation Guard Logic

```typescript
// src/common/guards/flat-isolation.guard.ts

canActivate(context: ExecutionContext): boolean {
  const request = context.switchToHttp().getRequest();
  const user = request.user;
  const tenantFlatId = request.tenantFlatId;

  // Super Admin bypasses isolation
  if (user.role === Role.SUPER_ADMIN) return true;

  // Tenant must match user's flat
  if (!user.flatId || user.flatId !== tenantFlatId) {
    throw new ForbiddenException('Access denied: cross-tenant access');
  }

  return true;
}
```

---

## Frontend Tenant Detection

```typescript
// src/middleware.ts

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'caretakerapp.com';

  let slug: string | null = null;

  // Production: abc.caretakerapp.com
  if (host.endsWith(`.${appDomain}`)) {
    slug = host.replace(`.${appDomain}`, '').split('.')[0];
  }
  // Local: abc.localhost:3000
  else if (host.includes('.localhost')) {
    slug = host.split('.')[0];
  }
  // Fallback: ?tenant=abc
  const tenantParam = url.searchParams.get('tenant');
  if (tenantParam) slug = tenantParam;

  // Set cookie for all subsequent requests
  response.cookies.set('tenant-slug', slug);
}
```

---

## Axios Client Tenant Header Injection

```typescript
// src/lib/api/client.ts

axiosInstance.interceptors.request.use((config) => {
  // JWT token
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Tenant slug from cookie
  const slug = getCookie('tenant-slug');
  if (slug) config.headers['X-Tenant-Slug'] = slug;

  return config;
});
```

---

## Onboarding a New Apartment

1. Super Admin logs in at `caretakerapp.com/admin`
2. Creates a new Flat with a unique slug (e.g., `sunrise`)
3. System auto-sets `subdomain = sunrise.caretakerapp.com`
4. Super Admin creates users for that flat (Association, Security, Residents)
5. Super Admin adds grocery items, hotels, services for the flat
6. Residents access at `sunrise.caretakerapp.com` or `localhost:3000?tenant=sunrise`

**No DNS changes needed** — the wildcard `*.caretakerapp.com` already routes all subdomains to the same server.

---

## Data Isolation Guarantees

| Scenario | Behavior |
|----------|---------|
| Resident of ABC tries to access GreenView data | FlatIsolationGuard → 403 |
| Security of GreenView approves ABC gate pass | FlatIsolationGuard → 403 |
| Super Admin accessing ABC data via API | Passes (role bypass) |
| Super Admin accessing GreenView data | Passes (role bypass) |
| Inactive flat user tries to log in | TenantMiddleware → 403 |
| Unknown subdomain request | TenantMiddleware → 404 |
| JWT token for flat A used on flat B subdomain | FlatIsolationGuard → 403 |

---

## Scaling Considerations

### Current Architecture (Single DB)
- Simple migrations
- Easy backup/restore
- Suitable for up to ~50 tenants / ~10,000 users
- Row-level isolation via `flatId`

### Future Options (if needed)
- **Schema-per-tenant**: Each tenant gets its own PostgreSQL schema (more isolation, harder migrations)
- **Database-per-tenant**: Maximum isolation, expensive, for enterprise scale
- **Row-Level Security (RLS)**: PostgreSQL native RLS policies on `flatId` columns

---

## Subdomain URL Examples

| Flat | Slug | URL |
|------|------|-----|
| ABC Apartment | abc | abc.caretakerapp.com |
| Green View Apartment | greenview | greenview.caretakerapp.com |
| Sunrise Towers | sunrise | sunrise.caretakerapp.com |
| Palm Beach Residency | palmbeach | palmbeach.caretakerapp.com |

---

*Caretaker SaaS — Built by Reizindia Tech Solutions*
