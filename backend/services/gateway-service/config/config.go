package config

import (
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port         string
	Environment  string
	FrontendURLs []string
	RedisURL     string
	RateLimit    RateLimitConfig
	Services     ServicesRoutes
}

type RateLimitConfig struct {
	Enabled   bool
	Requests  int
	WindowSec int
}

type ServicesRoutes struct {
	AuthServiceURL     string
	UserServiceURL     string
	AuditServiceURL    string
	RealtimeServiceURL string
	QuestionServiceURL string
}

func LoadConfig() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	frontendURLsStr := getEnv("FRONTEND_URLS", "http://localhost:5173")
	frontendURLs := strings.Split(frontendURLsStr, ",")
	for i := range frontendURLs {
		frontendURLs[i] = strings.TrimSpace(frontendURLs[i])
	}
	rateLimitEnabled := getEnvBool("RATE_LIMIT_ENABLED", true)
	rateLimitRequests := getEnvInt("RATE_LIMIT_REQUESTS", 1000)
	rateLimitWindowSec := getEnvInt("RATE_LIMIT_WINDOW_SEC", 900)

	return &Config{
		Port:         getEnv("PORT", "5000"),
		Environment:  getEnv("GIN_MODE", "debug"),
		FrontendURLs: frontendURLs,
		RedisURL:     getEnv("REDIS_URL", "redis://localhost:6379"),
		RateLimit: RateLimitConfig{
			Enabled:   rateLimitEnabled,
			Requests:  rateLimitRequests,
			WindowSec: rateLimitWindowSec,
		},
		Services: ServicesRoutes{
			AuthServiceURL:     getEnv("AUTH_SERVICE_URL", "http://localhost:5001"),
			UserServiceURL:     getEnv("USER_SERVICE_URL", "http://localhost:5002"),
			AuditServiceURL:    getEnv("AUDIT_SERVICE_URL", "http://localhost:5022"),
			RealtimeServiceURL: getEnv("REALTIME_SERVICE_URL", "http://localhost:5023"),
			QuestionServiceURL: getEnv("QUESTION_SERVICE_URL", "http://localhost:5005"),
		},
	}
}

func getEnv(key, fallback string) string {
	if val, ok := os.LookupEnv(key); ok && val != "" {
		return val
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	if val, ok := os.LookupEnv(key); ok {
		if intVal, err := strconv.Atoi(val); err == nil {
			return intVal
		}
	}
	return fallback
}

func getEnvBool(key string, fallback bool) bool {
	if val, ok := os.LookupEnv(key); ok {
		if boolVal, err := strconv.ParseBool(val); err == nil {
			return boolVal
		}
	}
	return fallback
}
