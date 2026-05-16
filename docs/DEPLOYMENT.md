# Caretaker SaaS — Production Deployment Guide

## Deployment Options

| Option | Recommended For | Difficulty |
|--------|----------------|------------|
| Coolify (VPS) | Best for this project | Easy |
| Docker Compose on VPS | Manual control | Medium |
| Manual VPS setup | Advanced users | Hard |

---

## Option 1: Coolify (Recommended)

[Coolify](https://coolify.io) is a self-hostable Heroku/Netlify alternative that supports Docker Compose.

### Steps

1. Spin up a VPS (minimum 2GB RAM, 2 vCPU — DigitalOcean, Hetzner, Linode)
2. Install Coolify on VPS:
   ```bash
   curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
   ```
3. Access Coolify dashboard at `http://your-vps-ip:8000`
4. Add your Git repository
5. Create a new **Docker Compose** service pointing to `docker-compose.yml`
6. Add environment variables in Coolify's environment editor
7. Add your domain (`caretakerapp.com`) and enable SSL (Let's Encrypt auto)
8. Deploy

---

## Option 2: Docker Compose on VPS

### Prerequisites on VPS

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# Install Docker Compose
apt install docker-compose-plugin -y
```

### Steps

```bash
# 1. Clone the repository
git clone <repo-url> /opt/caretaker
cd /opt/caretaker

# 2. Set environment variables
cp apps/backend/.env.example apps/backend/.env
# Edit apps/backend/.env with production values

# 3. Start all services
docker compose up -d

# 4. Run migrations
docker compose exec backend npx prisma migrate deploy

# 5. Seed initial data (first time only)
docker compose exec backend npm run db:seed
```

---

## Environment Variables for Production

### Backend (`apps/backend/.env`)

```env
DATABASE_URL="postgresql://caretaker_user:STRONG_PASSWORD@postgres:5432/caretaker_db"
JWT_SECRET="GENERATE_WITH: openssl rand -hex 64"
JWT_EXPIRY="7d"
PORT=3001
NODE_ENV=production

# Cloudflare R2 Storage
STORAGE_ENDPOINT="https://<account-id>.r2.cloudflarestorage.com"
STORAGE_REGION="auto"
STORAGE_ACCESS_KEY_ID="your-r2-access-key-id"
STORAGE_SECRET_ACCESS_KEY="your-r2-secret-key"
STORAGE_BUCKET_NAME="caretaker-prod"
STORAGE_PUBLIC_URL="https://cdn.yourdomain.com"
```

### Frontend (`apps/frontend/.env.local` or Coolify env vars)

```env
NEXT_PUBLIC_API_URL=https://api.caretakerapp.com/api
NEXT_PUBLIC_APP_DOMAIN=caretakerapp.com
NEXT_PUBLIC_APP_NAME=Caretaker
```

---

## DNS Configuration

You need a wildcard DNS record so all tenant subdomains resolve to your VPS.

### DNS Records (in your domain registrar / Cloudflare)

```
A    caretakerapp.com         →  YOUR_VPS_IP
A    api.caretakerapp.com     →  YOUR_VPS_IP
A    *.caretakerapp.com       →  YOUR_VPS_IP   ← Wildcard for tenants
```

The wildcard `*.caretakerapp.com` handles:
- `abc.caretakerapp.com` → ABC Apartment
- `greenview.caretakerapp.com` → Green View Apartment
- `newflat.caretakerapp.com` → Any new tenant

---

## Nginx Reverse Proxy (if not using Coolify)

```nginx
# /etc/nginx/sites-available/caretaker

# Frontend — wildcard subdomain
server {
    listen 80;
    server_name *.caretakerapp.com caretakerapp.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# API
server {
    listen 80;
    server_name api.caretakerapp.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Enable and get SSL:
```bash
ln -s /etc/nginx/sites-available/caretaker /etc/nginx/sites-enabled/
certbot --nginx -d caretakerapp.com -d "*.caretakerapp.com" -d api.caretakerapp.com
nginx -s reload
```

> **Note**: Wildcard SSL certificates from Let's Encrypt require DNS challenge validation.

---

## SSL with Wildcard

```bash
# Using certbot with DNS challenge
certbot certonly --manual --preferred-challenges dns \
  -d caretakerapp.com \
  -d "*.caretakerapp.com"
```

Or use Cloudflare as your DNS provider and enable Cloudflare's SSL proxy — this handles wildcard HTTPS automatically.

---

## Database Backups

### Automated backup script

```bash
#!/bin/bash
# /opt/scripts/backup-db.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="/backups/caretaker_${TIMESTAMP}.sql"

docker compose -f /opt/caretaker/docker-compose.yml exec -T postgres \
  pg_dump -U caretaker_user caretaker_db > "$BACKUP_FILE"

# Keep only last 30 days
find /backups -name "caretaker_*.sql" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE"
```

```bash
# Run daily at 2 AM
crontab -e
# Add: 0 2 * * * /opt/scripts/backup-db.sh
```

---

## Adding a New Tenant (Apartment)

1. Log in as Super Admin at `https://caretakerapp.com/admin/dashboard`
2. Go to **Flats** → **Create New Flat**
3. Enter flat name, slug (e.g., `sunrise`), address, contact info
4. The system auto-generates: `sunrise.caretakerapp.com`
5. Create users for the flat (Association, Security, Residents)
6. Add grocery items, hotels, services for the flat
7. The subdomain works immediately (no DNS changes needed — wildcard handles it)

---

## Health Checks

```bash
# Check API health
curl https://api.caretakerapp.com/api/health

# Check frontend
curl https://caretakerapp.com

# Check tenant resolution
curl https://api.caretakerapp.com/api/tenant/by-slug/abc
```

---

## Monitoring

For a production deployment, consider:

- **Uptime**: UptimeRobot (free) — monitors `/api/health`
- **Logs**: Docker logs via `docker compose logs -f`
- **Alerts**: Set up email alerts in UptimeRobot for downtime

---

## Update / Redeploy

```bash
cd /opt/caretaker
git pull origin main

# Rebuild and restart
docker compose down
docker compose build --no-cache
docker compose up -d

# If schema changed
docker compose exec backend npx prisma migrate deploy
```

---

*Caretaker SaaS — Built by Reizindia Tech Solutions*
