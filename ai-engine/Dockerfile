FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --omit=dev

# Copy source (use compiled JS approach - no TypeScript needed at runtime)
COPY src/ ./src/

EXPOSE 3002

ENV PORT=3002
ENV NODE_ENV=production

# Start the service
CMD ["node", "src/server.js"]
