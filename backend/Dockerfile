FROM node:20-alpine AS builder

WORKDIR /app

# Copy prisma schema (from repo root context)
# When deploying via Railway with root context, prisma/ is at root
# When deploying with backend/ as context, copy it manually
COPY prisma/ ./prisma/

# Copy backend package files
COPY backend/package.json backend/package-lock.json* ./

# Install all dependencies (including devDeps needed for TypeScript build)
RUN npm ci

# Copy NestJS config files
COPY backend/nest-cli.json backend/tsconfig.json ./

# Copy backend source
COPY backend/src/ ./src/

# Generate Prisma client
RUN npx prisma generate

# Build NestJS
RUN npx nest build

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache ffmpeg

# Copy prisma for runtime migrations
COPY --from=builder /app/prisma ./prisma

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 4000

ENV PORT=4000
ENV NODE_ENV=production

CMD ["node", "dist/main.js"]
