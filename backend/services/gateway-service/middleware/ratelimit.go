package middleware

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/Hydra-Ramesh/devflow-v2/backend/services/gateway-service/config"
	"github.com/Hydra-Ramesh/devflow-v2/backend/services/gateway-service/log"
	"github.com/Hydra-Ramesh/devflow-v2/backend/services/gateway-service/res"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

type RateLimiter struct {
	client *redis.Client
	config config.RateLimitConfig
}

func NewRateLimiter(redisURL string, cfg config.RateLimitConfig) *RateLimiter {
	if !cfg.Enabled {
		return &RateLimiter{client: nil, config: cfg}
	}

	opts, err := redis.ParseURL(redisURL)
	if err != nil {
		opts = &redis.Options{
			Addr: redisURL,
		}
	}

	client := redis.NewClient(opts)

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	if err := client.Ping(ctx).Err(); err != nil {
		log.Warn("", "Redis connection failed (%v). Rate limiting bypassed in fail-open mode.", err)
	} else {
		log.Info("", "Redis rate limiter connected successfully.")
	}

	return &RateLimiter{
		client: client,
		config: cfg,
	}
}

func (rl *RateLimiter) Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		if !rl.config.Enabled || rl.client == nil {
			c.Next()
			return
		}

		ctx := c.Request.Context()
		clientIP := c.ClientIP()
		key := fmt.Sprintf("gateway:ratelimit:%s", clientIP)

		count, err := rl.client.Incr(ctx, key).Result()
		if err != nil {
			c.Next()
			return
		}

		if count == 1 {
			rl.client.Expire(ctx, key, time.Duration(rl.config.WindowSec)*time.Second)
		}

		if count > int64(rl.config.Requests) {
			res.Error(
				c,
				http.StatusTooManyRequests,
				"Too many requests. Please slow down and try again later.",
				nil,
			)
			return
		}

		c.Next()
	}
}
