package res

import (
	"time"

	"github.com/gin-gonic/gin"
)

type StandardResponse struct {
	Success   bool        `json:"success"`
	Status    string      `json:"status"`
	Message   string      `json:"message,omitempty"`
	Data      interface{} `json:"data,omitempty"`
	Error     interface{} `json:"error,omitempty"`
	TraceID   string      `json:"traceId,omitempty"`
	Timestamp string      `json:"timestamp"`
}

func JSON(c *gin.Context, statusCode int, message string, data interface{}) {
	corrID, _ := c.Get("X-Correlation-ID")
	traceID, _ := corrID.(string)

	c.JSON(statusCode, StandardResponse{
		Success:   statusCode >= 200 && statusCode < 300,
		Status:    "success",
		Message:   message,
		Data:      data,
		TraceID:   traceID,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	})
}

func Error(c *gin.Context, statusCode int, message string, errDetail interface{}) {
	corrID, _ := c.Get("X-Correlation-ID")
	traceID, _ := corrID.(string)

	c.AbortWithStatusJSON(statusCode, StandardResponse{
		Success:   false,
		Status:    "error",
		Message:   message,
		Error:     errDetail,
		TraceID:   traceID,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	})
}
