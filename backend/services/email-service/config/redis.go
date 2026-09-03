package config

import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	"github.com/redis/go-redis/v9"
)

var RDB *redis.Client
var ctx = context.Background()

func ConnectRedis() {
	redisUrl := os.Getenv("REDIS_URL")
	if redisUrl == "" {
		redisUrl = "redis://localhost:6379"
	}

	opt, err := redis.ParseURL(redisUrl)
	if err != nil {
		fmt.Println("Failed to parse Redis URL", err)
		os.Exit(1)
	}

	RDB = redis.NewClient(opt)

	_, err = RDB.Ping(ctx).Result()
	if err != nil {
		fmt.Println("Failed to connect to Redis", err)
		os.Exit(1)
	}

	fmt.Println("Connected to Redis Email Service")
}

type UserProfile struct {
	Email    string `json:"email"`
	FullName string `json:"full_name"`
}

func GetUserProfile(userID string) (*UserProfile, error) {
	val, err := RDB.Get(ctx, "user:profile:"+userID).Result()
	if err != nil {
		return nil, err
	}
	var profile UserProfile
	err = json.Unmarshal([]byte(val), &profile)
	return &profile, err
}

func SaveUserProfile(userID string, email string, fullName string) error {
	profile := UserProfile{Email: email, FullName: fullName}
	bytes, _ := json.Marshal(profile)
	return RDB.Set(ctx, "user:profile:"+userID, bytes, 0).Err()
}

func GetEntityAuthor(entityType string, entityID string) string {
	val, err := RDB.Get(ctx, "entity:author:"+entityType+":"+entityID).Result()
	if err != nil {
		return ""
	}
	return val
}
