#!/bin/bash
# ============================================
# Fix Nginx: Route API requests to correct services
# - api.getlumora.cloud → server.js (port 3001) for AI & main features
# - api.getlumora.cloud/api/v1/admin/* → NestJS backend (port 4000) if needed
# ============================================

cat > /etc/nginx/sites-available/getlumora.cloud << 'NGINX'
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name getlumora.cloud www.getlumora.cloud api.getlumora.cloud;
    return 301 https://$host$request_uri;
}

# Frontend (Next.js on port 3000)
server {
    listen 443 ssl;
    server_name getlumora.cloud www.getlumora.cloud;

    ssl_certificate /etc/letsencrypt/live/getlumora.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/getlumora.cloud/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# API Backend (Express server.js on port 3001)
server {
    listen 443 ssl;
    server_name api.getlumora.cloud;

    ssl_certificate /etc/letsencrypt/live/getlumora.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/getlumora.cloud/privkey.pem;

    client_max_body_size 500M;
    proxy_read_timeout 600s;
    proxy_connect_timeout 600s;
    proxy_send_timeout 600s;

    # All API requests go to Express server.js (port 3001)
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_buffering off;
    }
}
NGINX

# Test and reload
nginx -t && systemctl reload nginx && echo "✅ NGINX_UPDATED" || echo "❌ NGINX_FAILED"
