# Use Debian-based image (not Alpine) because canvas requires libcairo, pango, etc.
FROM node:20-slim

WORKDIR /app

# Install system dependencies for canvas, sharp, and ffmpeg
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies (with native module compilation)
RUN npm ci --omit=dev

# Copy server
COPY server.js ./

EXPOSE 3003

ENV PORT=3003
ENV NODE_ENV=production

CMD ["node", "server.js"]
