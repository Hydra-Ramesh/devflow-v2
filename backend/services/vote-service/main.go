package voteservice

import (
	"log"

	"github.com/Hydra-Ramesh/devflow-v2/backend/services/vote-service/config"
	"github.com/Hydra-Ramesh/devflow-v2/backend/services/vote-service/models"
	"github.com/Hydra-Ramesh/devflow-v2/backend/services/vote-service/routes"
	"github.com/gin-gonic/gin"
)

func main() {
	config.LoadConfig()

	config.ConnectDB()

	err := config.DB.AutoMigrate(&models.Vote{})
	if err != nil {
		log.Fatalf("Failed to auto-migrate database: %v", err)
	}

	config.ConnectRedis()

	config.ConnectKafka()

	router := gin.Default()

	routes.SetupRoutes(router)

	log.Printf("Starting vote-service-v2 on port %s", config.AppConfig.Port)
	if err := router.Run(":" + config.AppConfig.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
