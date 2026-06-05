FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install --omit=dev

COPY server.js ./

EXPOSE 3004

ENV PORT=3004
ENV NODE_ENV=production

CMD ["node", "server.js"]
