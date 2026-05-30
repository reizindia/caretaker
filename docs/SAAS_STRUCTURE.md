# SaaS Structure

Caretaker is a multi-tenant application. Each flat or apartment is a tenant.

## Tenant Routing

Production tenants are resolved from subdomains:

```text
https://<flat-slug>.<app-domain>
```

The frontend middleware extracts `<flat-slug>`, validates it with the backend tenant API, and stores the tenant slug cookie for API requests.

## Backend Isolation

Every tenant-scoped table stores `flatId`. Protected API routes use:

- JWT authentication
- Role guards
- Flat isolation guard
- Tenant middleware

Residents, security users, and flat association users can only access records for their own `flatId`. Super Admin routes are the only cross-tenant control surface.

## Production Data

Create real tenants and users during onboarding:

1. Provision the first Super Admin.
2. Create a real flat with a production slug.
3. Create association, security, and resident users.
4. Add real catalog, service, and marketplace data for that flat.
