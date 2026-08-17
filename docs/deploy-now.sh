#!/bin/bash
# =============================================
# DEPLOY LUMORA - Copy paste ke terminal VPS
# =============================================
APP="/var/www/nuviral/app"
cd "$APP" || { echo "❌ Folder $APP tidak ditemukan"; exit 1; }

echo "📥 Pulling latest..."
git pull origin main

echo "🔑 Setting FAL_KEY..."
grep -q "^FAL_KEY=" .env 2>/dev/null && sed -i 's|^FAL_KEY=.*|FAL_KEY=3a933e8a-529f-4580-8031-73c9dbd8d5fc:68e165370a47ac023e0ce2d6e892f6a3|' .env || echo "FAL_KEY=3a933e8a-529f-4580-8031-73c9dbd8d5fc:68e165370a47ac023e0ce2d6e892f6a3" >> .env

echo "🌐 Fixing Nginx..."
cat > /etc/nginx/sites-available/getlumora.cloud << 'NGINX'
server {
    listen 80;
    server_name getlumora.cloud www.getlumora.cloud api.getlumora.cloud;
    return 301 https://$host$request_uri;
}
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
server {
    listen 443 ssl;
    server_name api.getlumora.cloud;
    ssl_certificate /etc/letsencrypt/live/getlumora.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/getlumora.cloud/privkey.pem;
    client_max_body_size 500M;
    proxy_read_timeout 600s;
    proxy_connect_timeout 600s;
    proxy_send_timeout 600s;
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
ln -sf /etc/nginx/sites-available/getlumora.cloud /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx && echo "✅ Nginx OK" || echo "❌ Nginx error"

echo "📦 Installing deps..."
cd "$APP" && npm install --production 2>&1 | tail -2

echo "🖥️ Frontend env..."
cat > "$APP/frontend/.env.local" << 'EOF'
NEXT_PUBLIC_API_URL=https://api.getlumora.cloud/api/v1
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=Mid-client-CvuXZtiBb_TVQtGc
NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=true
EOF

echo "🔨 Building frontend..."
cd "$APP/frontend" && npm run build 2>&1 | tail -3

echo "♻️ Restarting services..."
cd "$APP"
pm2 delete all 2>/dev/null || true
pm2 start server.js --name lumora-api
pm2 start npm --name lumora-frontend -- start --prefix "$APP/frontend"
pm2 save

echo "⏳ Waiting 8s..."
sleep 8

echo "🏥 Health check..."
curl -s http://localhost:3001/ | head -1
echo ""
pm2 status
echo ""
echo "🎉 DONE! Test: https://getlumora.cloud/dashboard/quick-video"
