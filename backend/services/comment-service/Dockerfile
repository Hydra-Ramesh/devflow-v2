# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Production runtime stage
FROM node:20-alpine

WORKDIR /app

RUN apk --no-cache add curl tzdata

COPY package*.json ./

RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 5003

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
