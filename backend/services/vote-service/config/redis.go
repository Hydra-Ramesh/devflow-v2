package config

import (
	"context"
	"log"

	"github.com/go-redis/redis/v8"
)

var RedisClient *redis.Client
var Ctx = context.Background()

func ConnectRedis() {
	opt, err := redis.ParseURL(AppConfig.RedisURL)
	if err != nil {
		// Fallback if parsing fails (e.g. if just host:port is provided)
		opt = &redis.Options{
			Addr: AppConfig.RedisURL,
		}
	}
	RedisClient = redis.NewClient(opt)

	_, err = RedisClient.Ping(Ctx).Result()
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}
	log.Println("Redis connected successfully")
}
