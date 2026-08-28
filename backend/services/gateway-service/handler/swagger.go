package handler

import (
	_ "github.com/Hydra-Ramesh/devflow-v2/backend/services/gateway-service/docs"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// SwaggerHandler mounts the interactive Swagger UI and OpenAPI documentation
func SwaggerHandler() gin.HandlerFunc {
	return ginSwagger.WrapHandler(swaggerFiles.Handler)
}
