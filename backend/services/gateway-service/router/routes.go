package router

import (
	"github.com/Hydra-Ramesh/devflow-v2/backend/services/gateway-service/config"
	"github.com/Hydra-Ramesh/devflow-v2/backend/services/gateway-service/proxy"
	"github.com/gin-gonic/gin"
)

func RegisterServiceRoutes(r *gin.Engine, cfg *config.Config) {
	routeMap := map[string]string{
		"/api/auth": cfg.Services.AuthServiceURL,
	}

	for prefix, targetURL := range routeMap {
		target := targetURL
		basePrefix := prefix

		r.Any(basePrefix, proxy.Handler(target, "", ""))
		r.Any(basePrefix+"/*action", proxy.Handler(target, "", ""))

		v1Prefix := "/api/v1" + basePrefix[4:]
		r.Any(v1Prefix, proxy.Handler(target, "/api/v1", "/api"))
		r.Any(v1Prefix+"/*action", proxy.Handler(target, "/api/v1", "/api"))
	}

}
