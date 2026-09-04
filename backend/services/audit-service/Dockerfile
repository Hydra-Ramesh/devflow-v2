FROM node:20-alpine

WORKDIR /app

RUN apk --no-cache add curl tzdata

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 5008

ENV NODE_ENV=production

CMD ["node", "src/server.js"]
