package router

import (
	"github.com/Hydra-Ramesh/devflow-v2/backend/services/gateway-service/config"
	"github.com/Hydra-Ramesh/devflow-v2/backend/services/gateway-service/handler"
	"github.com/Hydra-Ramesh/devflow-v2/backend/services/gateway-service/middleware"
	"github.com/gin-gonic/gin"
)

func New(cfg *config.Config) *gin.Engine {
	if cfg.Environment == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()

	r.Use(middleware.Recovery())
	r.Use(middleware.SecurityHeaders())
	r.Use(middleware.CorrelationID())
	r.Use(middleware.RequestLogger())
	r.Use(middleware.CORS(cfg.FrontendURLs))

	rateLimiter := middleware.NewRateLimiter(cfg.RedisURL, cfg.RateLimit)
	r.Use(rateLimiter.Middleware())

	r.GET("/health", handler.HealthHandler())
	r.GET("/metrics", handler.MetricsHandler())
	r.GET("/swagger/*any", handler.SwaggerHandler())
	r.GET("/docs", func(c *gin.Context) {
		c.Redirect(301, "/swagger/index.html")
	})

	RegisterServiceRoutes(r, cfg)

	r.NoRoute(handler.FallbackHandler())

	return r
}
