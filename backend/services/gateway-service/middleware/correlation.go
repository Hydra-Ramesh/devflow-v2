package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const CorrelationIDHeader = "X-Correlation-ID"

func CorrelationID() gin.HandlerFunc {
	return func(c *gin.Context) {
		corrID := c.GetHeader(CorrelationIDHeader)
		if corrID == "" {
			corrID = uuid.New().String()
		}

		c.Set(CorrelationIDHeader, corrID)
		c.Request.Header.Set(CorrelationIDHeader, corrID)
		c.Writer.Header().Set(CorrelationIDHeader, corrID)
		c.Next()
	}
}
