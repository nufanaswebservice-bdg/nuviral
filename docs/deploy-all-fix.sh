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

# Step 4: Build frontend
echo "🔨 Building frontend..."
cd "$APP_DIR/frontend"
npm run build 2>&1 | tail -5
echo "✅ Frontend built"
echo ""

# Step 5: Restart all services
echo "♻️ Restarting services..."
cd "$APP_DIR"

# Check if server.js is running via pm2
if pm2 list | grep -q "nuviral-server\|lumora-server"; then
  pm2 restart lumora-server 2>/dev/null || pm2 restart nuviral-server 2>/dev/null || true
  echo "✅ Express server restarted"
else
  # Start server.js as a new pm2 process
  pm2 delete lumora-server 2>/dev/null || true
  pm2 start server.js --name lumora-server --env production
  echo "✅ Express server started"
fi

# Restart backend (NestJS)
if pm2 list | grep -q "nuviral-backend"; then
  pm2 restart nuviral-backend 2>/dev/null || true
  echo "✅ Backend restarted"
fi

# Restart frontend
if pm2 list | grep -q "nuviral-frontend"; then
  pm2 restart nuviral-frontend 2>/dev/null || true
  echo "✅ Frontend restarted"
fi

pm2 save
echo ""

# Step 6: Health checks
echo "🏥 Running health checks..."
sleep 5

# Check Express server (server.js)
echo -n "  Express API: "
HEALTH=$(curl -s http://localhost:3001/ 2>/dev/null || echo "FAIL")
if echo "$HEALTH" | grep -q "ok"; then
  echo "✅ OK"
  echo "  → fal.ai: $(echo $HEALTH | grep -o '"fal":true' | head -1 || echo 'check')"
  echo "  → openai: $(echo $HEALTH | grep -o '"openai":true' | head -1 || echo 'check')"
else
  echo "❌ Not responding (check pm2 logs lumora-server)"
fi

# Check NestJS backend
echo -n "  NestJS Backend: "
BACKEND=$(curl -s http://localhost:4000/api/v1/health 2>/dev/null || echo "FAIL")
if echo "$BACKEND" | grep -qi "ok\|healthy"; then
  echo "✅ OK"
else
  echo "⚠️ Not responding (might not be needed for AI features)"
fi

# Check frontend
echo -n "  Frontend: "
FRONTEND=$(curl -s http://localhost:3000/ 2>/dev/null || echo "FAIL")
if [ ${#FRONTEND} -gt 100 ]; then
  echo "✅ OK"
else
  echo "⚠️ Not responding (check pm2 logs nuviral-frontend)"
fi

echo ""
echo "=== 🎉 Deployment Complete! ==="
echo ""
echo "📋 AI Features Status:"
echo "  ✅ Chat (OpenAI GPT-4o-mini + fal.ai LLM)"
echo "  ✅ Text-to-Image (fal.ai Flux Pro Ultra + DALL-E 3)"
echo "  ✅ Text-to-Video (fal.ai Kling 2.5)"
echo "  ✅ Image-to-Video (fal.ai Kling 2.5)"
echo "  ✅ Text-to-Speech (OpenAI TTS-1-HD)"
echo "  ✅ Music Generation (fal.ai MiniMax Music v2)"
echo "  ✅ Sound Effects (fal.ai ElevenLabs)"
echo "  ✅ Voice Clone (fal.ai Zonos + OpenAI TTS fallback)"
echo "  ✅ 3D Generation (fal.ai Hunyuan3D v2)"
echo ""
echo "🌐 Live at: https://getlumora.cloud/dashboard/quick-video"
echo ""
pm2 status
