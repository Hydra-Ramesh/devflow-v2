package routes

import (
	"github.com/Hydra-Ramesh/devflow-v2/backend/services/vote-service/controllers"
	"github.com/Hydra-Ramesh/devflow-v2/backend/services/vote-service/middlewares"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	api := router.Group("/api/votes")

	api.Use(middlewares.RequireAuth())

	api.POST("/toggle", controllers.ToggleVote)
}
