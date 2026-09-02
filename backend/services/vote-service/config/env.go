package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port        string
	DatabaseURL string
	RedisURL    string
	KafkaBroker string
	JWTSecret   string
}

var AppConfig *Config

func LoadConfig() {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found or error loading it. Using environment variables.")
	}

	AppConfig = &Config{
		Port:        getEnv("PORT", "5007"),
		DatabaseURL: getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/devflow_votes?sslmode=disable"),
		RedisURL:    getEnv("REDIS_URL", "localhost:6379"),
		KafkaBroker: getEnv("KAFKA_BROKERS", "localhost:9092"),
		JWTSecret:   getEnv("JWT_SECRET", "your-super-secret-jwt-key"),
	}
}

func getEnv(key, defaultVal string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultVal
}
