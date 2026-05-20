# ViralAI Deployment Guide

## Deployment Options

### 1. Docker (Recommended)

```bash
# Clone repository
git clone https://github.com/your-org/viralai.git
cd viralai

# Configure environment
cp .env.example .env
# Edit .env with your production values

# Build and start
cd docker
docker-compose up -d

# Run migrations
docker exec viralai-backend npx prisma migrate deploy

# Seed database (optional)
docker exec viralai-backend npx prisma db seed
```

### 2. VPS Ubuntu (Manual)

#### Prerequisites
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql

# Install Redis
sudo apt install -y redis-server
sudo systemctl start redis

# Install FFmpeg
sudo apt install -y ffmpeg

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

#### Database Setup
```bash
sudo -u postgres psql
CREATE DATABASE viralai;
CREATE USER viralai_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE viralai TO viralai_user;
\q
```

#### Application Setup
```bash
# Clone and install
git clone https://github.com/your-org/viralai.git /opt/viralai
cd /opt/viralai
npm install

# Configure environment
cp .env.example .env
nano .env  # Edit with production values

# Build
npm run build

# Run migrations
npx prisma migrate deploy

# Start with PM2
pm2 start backend/dist/main.js --name viralai-api
pm2 start worker/dist/index.js --name viralai-worker
pm2 save
pm2 startup
```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name api.viralai.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 500M;
    }
}
```

#### SSL with Certbot
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.viralai.com
```

### 3. Vercel (Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

Environment variables to set in Vercel:
- `NEXT_PUBLIC_API_URL` = your API URL

### 4. Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### 5. AWS

#### Architecture
- **ECS Fargate** — Backend API + Worker containers
- **RDS PostgreSQL** — Database
- **ElastiCache Redis** — Cache & Queue
- **S3** — File storage
- **CloudFront** — CDN
- **ALB** — Load balancer

#### Quick Setup with AWS CDK
```bash
cd infrastructure
npm install
npx cdk deploy
```

---

## Production Checklist

- [ ] Set all environment variables
- [ ] Configure SSL/TLS certificates
- [ ] Set up database backups
- [ ] Configure monitoring (Sentry, CloudWatch)
- [ ] Set up log rotation
- [ ] Configure rate limiting
- [ ] Set up CDN for static assets
- [ ] Configure email service (SES/SendGrid)
- [ ] Set up Stripe webhooks
- [ ] Configure social media API keys
- [ ] Set up CI/CD pipeline
- [ ] Load testing
- [ ] Security audit

## Scaling

### Horizontal Scaling
- Run multiple API instances behind a load balancer
- Scale workers independently based on queue depth
- Use Redis Cluster for high availability

### Database Scaling
- Read replicas for analytics queries
- Connection pooling with PgBouncer
- Partitioning for large tables (analytics, logs)

### Storage
- Use S3/CloudFlare R2 for video storage
- CDN for serving rendered videos
- Lifecycle policies for old renders
