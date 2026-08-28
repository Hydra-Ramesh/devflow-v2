package handler

import (
	"net/http"
	"time"

	"github.com/Hydra-Ramesh/devflow-v2/backend/services/gateway-service/res"
	"github.com/gin-gonic/gin"
)

var startTime = time.Now()

func HealthHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		uptime := time.Since(startTime).String()

		res.JSON(c, http.StatusOK, "Gateway is Operational", gin.H{
			"service": "DevFlow Gateway Service",
			"version": "v1.0.0",
			"uptime":  uptime,
			"status":  "healthy",
		})
	}
}
