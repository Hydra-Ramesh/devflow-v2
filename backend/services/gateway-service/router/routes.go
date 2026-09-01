package router

import (
	"github.com/Hydra-Ramesh/devflow-v2/backend/services/gateway-service/config"
	"github.com/Hydra-Ramesh/devflow-v2/backend/services/gateway-service/proxy"
	"github.com/gin-gonic/gin"
)

func RegisterServiceRoutes(r *gin.Engine, cfg *config.Config) {
	routeMap := map[string]string{
		"/api/auth":      cfg.Services.AuthServiceURL,
		"/api/users":     cfg.Services.UserServiceURL,
		"/api/talent":    cfg.Services.UserServiceURL,
		"/api/audit":     cfg.Services.AuditServiceURL,
		"/api/questions": cfg.Services.QuestionServiceURL,
		"/api/answers":   cfg.Services.AnswerServiceURL,
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

	authTarget := cfg.Services.AuthServiceURL
	r.Any("/oauth2/*action", proxy.Handler(authTarget, "", ""))
	r.Any("/login/oauth2/*action", proxy.Handler(authTarget, "", ""))

	realtimeTarget := cfg.Services.RealtimeServiceURL
	r.Any("/socket.io/*action", proxy.Handler(realtimeTarget, "", ""))

}
