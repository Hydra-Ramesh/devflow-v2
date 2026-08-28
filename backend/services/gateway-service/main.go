package gatewayservice

import (
	"github.com/Hydra-Ramesh/devflow-v2/backend/services/gateway-service/config"
	"github.com/Hydra-Ramesh/devflow-v2/backend/services/gateway-service/log"
	"github.com/Hydra-Ramesh/devflow-v2/backend/services/gateway-service/router"
	"github.com/Hydra-Ramesh/devflow-v2/backend/services/gateway-service/server"
)

func main() {
	cfg := config.LoadConfig()
	r := router.New(cfg)

	srv := server.New(cfg, r)

	if err := srv.Start(); err != nil {
		log.Fatal("Server terminated unexpectedly: %v", err)
	}
}
