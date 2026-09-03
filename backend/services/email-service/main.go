package main

import (
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/Hydra-Ramesh/devflow-v2/backend/services/email-service/config"
	"github.com/Hydra-Ramesh/devflow-v2/backend/services/email-service/kafka"
	"github.com/joho/godotenv"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func main() {
	fmt.Println("Starting Email Service (Golang)...")

	_ = godotenv.Load()

	config.ConnectRedis()

	kafka.StartConsumers()

	// Setup HTTP server for metrics and health
	port := os.Getenv("PORT")
	if port == "" {
		port = "5024" // default port for email-service
	}

	mux := http.NewServeMux()
	mux.Handle("/metrics", promhttp.Handler())
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status": "ok", "service": "email-service"}`))
	})

	server := &http.Server{
		Addr:    ":" + port,
		Handler: mux,
	}

	go func() {
		fmt.Println("🚀 Email metrics server running on port", port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			fmt.Printf("HTTP server error: %v\n", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	fmt.Println("\nShutting down gracefully...")
	server.Close()
	kafka.DisconnectKafka()
	if config.RDB != nil {
		config.RDB.Close()
	}
	fmt.Println(" All resources cleanly terminated. Exiting.")
}
