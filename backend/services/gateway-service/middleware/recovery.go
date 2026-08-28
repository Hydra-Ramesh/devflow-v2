package middleware

import (
	"net/http"
	"runtime/debug"

	"github.com/Hydra-Ramesh/devflow-v2/backend/services/gateway-service/log"
	"github.com/Hydra-Ramesh/devflow-v2/backend/services/gateway-service/res"
	"github.com/gin-gonic/gin"
)

func Recovery() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				corrID, _ := c.Get(CorrelationIDHeader)
				traceID, _ := corrID.(string)

				log.Error(traceID, "Panic recovered: %v\nStack: %s", err, string(debug.Stack()))

				res.Error(
					c,
					http.StatusInternalServerError,
					"Internal gateway error. Please try again later.",
					nil,
				)
			}
		}()
		c.Next()
	}
}
