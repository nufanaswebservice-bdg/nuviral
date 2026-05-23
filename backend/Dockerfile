FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
COPY backend/package.json ./backend/
COPY shared/package.json ./shared/
COPY prisma/ ./prisma/

RUN npm ci --workspace=backend --workspace=shared

# Copy source
COPY shared/ ./shared/
COPY backend/ ./backend/

# Generate Prisma client
RUN npx prisma generate

# Build
RUN npm run build --workspace=backend

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache ffmpeg

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Railway uses PORT env variable
ENV PORT=4000
EXPOSE 4000

CMD ["node", "dist/main.js"]
