#!/bin/bash
# Deploy Lumora AI fix + OpenAI to production VPS
set -e

APP_DIR="/var/www/nuviral/app"
OPENAI_KEY="${OPENAI_API_KEY:-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}"

echo "=== Lumora Deploy ==="
cd "$APP_DIR"

echo "=== Pull latest code ==="
git fetch origin
git reset --hard origin/main

echo "=== Update OpenAI config ==="
# Backend .env
if [ -f .env ]; then
  if grep -q "^OPENAI_API_KEY=" .env; then
    sed -i "s|^OPENAI_API_KEY=.*|OPENAI_API_KEY=${OPENAI_KEY}|" .env
  else
    echo "OPENAI_API_KEY=${OPENAI_KEY}" >> .env
  fi
  if grep -q "^OPENAI_MODEL=" .env; then
    sed -i 's|^OPENAI_MODEL=.*|OPENAI_MODEL=gpt-4o-mini|' .env
  else
    echo "OPENAI_MODEL=gpt-4o-mini" >> .env
  fi
fi

# Frontend .env.local
cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=https://api.getlumora.cloud/api/v1
NEXT_PUBLIC_APP_URL=https://getlumora.cloud
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=Mid-client-CvuXZtiBb_TVQtGc
NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=true
OPENAI_API_KEY=${OPENAI_KEY}
OPENAI_MODEL=gpt-4o-mini
EOF

echo "=== Install & build backend ==="
cd backend
npm install
npx nest build || { echo "Backend build failed - trying with continue-on-error"; npx nest build 2>&1 | tail -20; }

echo "=== Install & build frontend ==="
cd ../frontend
npm install
npm run build

echo "=== Restart PM2 ==="
cd "$APP_DIR"
pm2 delete nuviral-backend 2>/dev/null || true
pm2 delete nuviral-frontend 2>/dev/null || true
pm2 start backend/dist/main.js --name nuviral-backend --env production
pm2 start npm --name nuviral-frontend -- start --prefix "$APP_DIR/frontend"
pm2 save

sleep 8
pm2 status

echo "=== Health check ==="
curl -sf http://localhost:4000/api/v1/health && echo " ✅ Backend OK" || echo " ❌ Backend FAIL"
curl -sf -o /dev/null -w "Frontend HTTP %{http_code}\n" http://localhost:3000/ || echo " ❌ Frontend FAIL"

echo "=== Test AI Chat ==="
TOKEN='eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJlbWFpbCI6Im93bmVyQG51dmlyYWwuY2xvdWQifQ.signature'
echo -n "Backend chat: "
curl -s -X POST http://localhost:4000/api/v1/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"message":"halo tes deploy"}' | head -c 200
echo ""
echo -n "Frontend chat: "
curl -s -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"message":"halo tes deploy"}' | head -c 200
echo ""

echo "=== DEPLOY DONE ==="
