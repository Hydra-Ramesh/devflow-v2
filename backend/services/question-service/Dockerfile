# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN apk --no-cache add openssl
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

# Production runtime stage
FROM node:20-alpine

WORKDIR /app

RUN apk --no-cache add curl tzdata openssl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production
RUN npx prisma generate

COPY --from=builder /app/dist ./dist

EXPOSE 5005

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
