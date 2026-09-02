package routes

import (
	"github.com/Hydra-Ramesh/devflow-v2/backend/services/vote-service/controllers"
	"github.com/Hydra-Ramesh/devflow-v2/backend/services/vote-service/logger"
	"github.com/Hydra-Ramesh/devflow-v2/backend/services/vote-service/middlewares"
	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func SetupRoutes(router *gin.Engine) {
	// Tracing Middleware
	router.Use(func(c *gin.Context) {
		corrID := c.GetHeader("X-Correlation-ID")
		if corrID == "" {
			corrID = "system-generated"
		}
		c.Set("correlation_id", corrID)
		logger.Info(c, "Incoming %s request to %s", c.Request.Method, c.Request.URL.Path)
		c.Next()
	})

	router.GET("/metrics", gin.WrapH(promhttp.Handler()))

	api := router.Group("/api/votes")

	api.Use(middlewares.RequireAuth())

	api.POST("/toggle", controllers.ToggleVote)
}
