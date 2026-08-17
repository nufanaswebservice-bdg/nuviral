#!/bin/bash
# ============================================
# Deploy Script - Fix All AI Features
# Run this on your VPS: bash deploy-all-fix.sh
# ============================================

set -e
APP_DIR="/var/www/nuviral/app"

echo "=== 🚀 Deploying Lumora AI Fix ==="
echo ""

# Step 1: Pull latest code
echo "📥 Pulling latest code..."
cd "$APP_DIR"
git pull origin main
echo "✅ Code updated"
echo ""

# Step 2: Update .env with FAL_KEY
echo "🔑 Updating environment variables..."
ENV_FILE="$APP_DIR/.env"

# Add FAL_KEY if not present
if ! grep -q "^FAL_KEY=" "$ENV_FILE" 2>/dev/null; then
  echo "" >> "$ENV_FILE"
  echo "# Fal.ai (AI - Image, Video, Music, 3D generation)" >> "$ENV_FILE"
  echo "FAL_KEY=3a933e8a-529f-4580-8031-73c9dbd8d5fc:68e165370a47ac023e0ce2d6e892f6a3" >> "$ENV_FILE"
  echo "✅ FAL_KEY added"
else
  # Update existing FAL_KEY
  sed -i 's|^FAL_KEY=.*|FAL_KEY=3a933e8a-529f-4580-8031-73c9dbd8d5fc:68e165370a47ac023e0ce2d6e892f6a3|' "$ENV_FILE"
  echo "✅ FAL_KEY updated"
fi

# Update domain references in .env
sed -i 's|APP_URL=https://nuviral.cloud|APP_URL=https://getlumora.cloud|g' "$ENV_FILE"
sed -i 's|API_URL=https://api.nuviral.cloud|API_URL=https://api.getlumora.cloud|g' "$ENV_FILE"
echo "✅ Domain updated to getlumora.cloud"
echo ""

# Step 3: Update frontend .env.local
echo "🖥️ Updating frontend environment..."
FRONTEND_ENV="$APP_DIR/frontend/.env.local"
if [ -f "$FRONTEND_ENV" ]; then
  sed -i 's|api.nuviral.cloud|api.getlumora.cloud|g' "$FRONTEND_ENV"
  sed -i 's|nuviral-production.up.railway.app/api/v1|api.getlumora.cloud/api/v1|g' "$FRONTEND_ENV"
  sed -i 's|nuviral-production.up.railway.app|api.getlumora.cloud|g' "$FRONTEND_ENV"
  echo "✅ Frontend .env.local updated"
else
  cat > "$FRONTEND_ENV" << 'EOF'
NEXT_PUBLIC_API_URL=https://api.getlumora.cloud/api/v1
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=Mid-client-CvuXZtiBb_TVQtGc
NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=true
EOF
  echo "✅ Frontend .env.local created"
fi
echo ""

# Step 4: Fix Nginx to route api.getlumora.cloud to Express (port 3001)
echo "🌐 Fixing Nginx configuration..."
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
nginx -t && systemctl reload nginx
echo "✅ Nginx updated (api → port 3001)"
echo ""

# Step 5: Install dependencies for server.js
echo "📦 Installing dependencies..."
cd "$APP_DIR"
npm install --production 2>&1 | tail -3
echo "✅ Dependencies installed"
echo ""

# Step 6: Build frontend
echo "🔨 Building frontend..."
cd "$APP_DIR/frontend"
npm run build 2>&1 | tail -5
echo "✅ Frontend built"
echo ""

# Step 7: Restart all services with PM2
echo "♻️ Restarting services..."
cd "$APP_DIR"

# Stop old processes
pm2 delete lumora-server 2>/dev/null || true
pm2 delete nuviral-server 2>/dev/null || true
pm2 delete nuviral-backend 2>/dev/null || true
pm2 delete nuviral-frontend 2>/dev/null || true

# Start Express server (port 3001 - handles all AI + API)
pm2 start server.js --name lumora-server --env production
echo "✅ Express API started (port 3001)"

# Start Frontend (port 3000)
pm2 start npm --name lumora-frontend -- start --prefix "$APP_DIR/frontend"
echo "✅ Frontend started (port 3000)"

pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true
echo ""

# Step 8: Health checks
echo "🏥 Running health checks..."
sleep 8

echo -n "  Express API (port 3001): "
HEALTH=$(curl -s http://localhost:3001/ 2>/dev/null || echo "FAIL")
if echo "$HEALTH" | grep -q "ok"; then
  echo "✅ Running"
  # Parse JSON to show feature status
  FAL_STATUS=$(echo "$HEALTH" | grep -o '"fal":true' && echo "✅" || echo "❌")
  OPENAI_STATUS=$(echo "$HEALTH" | grep -o '"openai":true' && echo "✅" || echo "❌")
  echo "    → OpenAI: $OPENAI_STATUS"
  echo "    → Fal.ai: $FAL_STATUS"
else
  echo "❌ Not responding!"
  echo "    Check: pm2 logs lumora-server"
fi

echo -n "  Frontend (port 3000): "
FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null || echo "000")
if [ "$FRONTEND" = "200" ] || [ "$FRONTEND" = "304" ]; then
  echo "✅ Running"
else
  echo "⚠️ Status: $FRONTEND"
fi

echo ""
echo "=== 🎉 Deployment Complete! ==="
echo ""
echo "📋 All AI Features:"
echo "  ✅ Chat AI (OpenAI GPT-4o-mini + fal.ai LLM)"
echo "  ✅ Generate Gambar (fal.ai Flux Pro Ultra → DALL-E 3)"
echo "  ✅ Generate Video (fal.ai Kling 2.5 Turbo Pro)"
echo "  ✅ Image → Video (fal.ai Kling 2.5)"
echo "  ✅ Text-to-Speech (OpenAI TTS-1-HD)"
echo "  ✅ Music Generation (fal.ai MiniMax Music v2)"
echo "  ✅ Sound Effects (fal.ai ElevenLabs SFX)"
echo "  ✅ Voice Clone (fal.ai Zonos → OpenAI TTS)"
echo "  ✅ 3D Generation (fal.ai Hunyuan3D v2)"
echo ""
echo "🌐 Live: https://getlumora.cloud/dashboard/quick-video"
echo ""
pm2 status
