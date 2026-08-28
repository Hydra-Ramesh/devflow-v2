package middleware

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

func RequestLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		startTime := time.Now()
		path := c.Request.URL.Path
		rawQuery := c.Request.URL.RawQuery
		if rawQuery != "" {
			path = path + "?" + rawQuery
		}

		c.Next()

		latency := time.Since(startTime)
		statusCode := c.Writer.Status()
		clientIP := c.ClientIP()
		method := c.Request.Method
		corrID, _ := c.Get(CorrelationIDHeader)

		log.Printf("[Gateway] [%v] %3d | %12v | %15s | %-7s %s",
			corrID,
			statusCode,
			latency,
			clientIP,
			method,
			path,
		)
	}
}
