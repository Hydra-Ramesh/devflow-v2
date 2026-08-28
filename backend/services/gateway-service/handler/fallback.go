package handler

import (
	"net/http"

	"github.com/Hydra-Ramesh/devflow-v2/backend/services/gateway-service/res"
	"github.com/gin-gonic/gin"
)

func FallbackHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		res.Error(
			c,
			http.StatusNotFound,
			"Gateway route not found or downstream service is not registered.",
			gin.H{
				"path":   c.Request.URL.Path,
				"method": c.Request.Method,
			},
		)
	}
}
