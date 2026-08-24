FROM node:22-alpine AS builder

WORKDIR /app
ARG SERVICE_NAME

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Copy root package.json if exists for workspaces (not strictly needed since each has its own)
# Copy the specific service's package.json
COPY services/${SERVICE_NAME}/package.json ./

# Install dependencies with legacy-peer-deps to bypass express-async-errors peer conflicts with Express 5
RUN npm install --omit=dev --legacy-peer-deps

# Copy the rest of the service source code
COPY services/${SERVICE_NAME} ./

# Copy Prisma 7 config
COPY prisma.config.ts ./

# If the service uses Prisma, generate the client
RUN if [ -d "prisma" ]; then npx prisma generate; fi

# Production image
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache openssl

COPY --from=builder /app ./

CMD ["npm", "start"]
