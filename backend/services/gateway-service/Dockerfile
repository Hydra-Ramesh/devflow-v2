FROM golang:1.22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache git ca-certificates

COPY go.mod ./
RUN go mod download || true

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /gateway ./cmd/gateway

FROM alpine:3.19

RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app

COPY --from=builder /gateway /app/gateway
COPY .env.example /app/.env

EXPOSE 5000

ENTRYPOINT ["/app/gateway"]
