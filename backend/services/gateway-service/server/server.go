package server

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/Hydra-Ramesh/devflow-v2/backend/services/gateway-service/config"
	"github.com/Hydra-Ramesh/devflow-v2/backend/services/gateway-service/log"
	"github.com/gin-gonic/gin"
)

type Server struct {
	httpServer *http.Server
	cfg        *config.Config
}

func New(cfg *config.Config, handler *gin.Engine) *Server {
	return &Server{
		httpServer: &http.Server{
			Addr:         ":" + cfg.Port,
			Handler:      handler,
			ReadTimeout:  30 * time.Second,
			WriteTimeout: 30 * time.Second,
			IdleTimeout:  120 * time.Second,
		},
		cfg: cfg,
	}
}

func (s *Server) Start() error {
	serverErrors := make(chan error, 1)

	go func() {
		s.printBanner()
		serverErrors <- s.httpServer.ListenAndServe()
	}()

	shutdown := make(chan os.Signal, 1)
	signal.Notify(shutdown, os.Interrupt, syscall.SIGTERM)

	select {
	case err := <-serverErrors:
		if err != nil && err != http.ErrServerClosed {
			return fmt.Errorf("gateway listener fatal error: %w", err)
		}

	case sig := <-shutdown:
		log.Info("", "Received shutdown signal [%v]. Draining in-flight requests...", sig)

		ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
		defer cancel()

		if err := s.httpServer.Shutdown(ctx); err != nil {
			log.Error("", "Graceful shutdown timeout exceeded (%v). Forcing termination.", err)
			return s.httpServer.Close()
		}

		log.Info("", "Gateway server stopped cleanly.")
	}

	return nil
}

func (s *Server) printBanner() {
	fmt.Println("=================================================================")
	fmt.Println("  ⚡ DevFlow Enterprise API Gateway (Go + Gin Gonic)")
	fmt.Println("=================================================================")
	fmt.Printf("  🚀 Listener Port:               :%s\n", s.cfg.Port)
	fmt.Printf("  🔗 Auth Service Upstream:       %s (Java Spring Boot)\n", s.cfg.Services.AuthServiceURL)
	fmt.Printf("  📊 Prometheus Metrics Endpoint: http://localhost:%s/metrics\n", s.cfg.Port)
	fmt.Printf("  🩺 System Health Check:         http://localhost:%s/health\n", s.cfg.Port)
	fmt.Printf("  📖 Interactive Swagger UI:      http://localhost:%s/swagger/index.html\n", s.cfg.Port)
	fmt.Println("=================================================================")
}
