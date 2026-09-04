package main

import (
	"log"
	"net/http"
	"os"

	"github.com/Hydra-Ramesh/devflow-v2/backend/services/media-service/config"
	"github.com/Hydra-Ramesh/devflow-v2/backend/services/media-service/handler"
	"github.com/Hydra-Ramesh/devflow-v2/backend/services/media-service/middlewares"

	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()

	config.InitCloudinary()

	mux := http.NewServeMux()

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"UP","service":"media-service-v2"}`))
	})

	mux.HandleFunc("/api/medias", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			handler.GetAll(w, r)
		} else if r.Method == http.MethodPost {
			middlewares.RequireAuth(handler.UploadImage)(w, r)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/api/medias/upload", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			middlewares.RequireAuth(handler.UploadImage)(w, r)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/api/upload", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			middlewares.RequireAuth(handler.UploadImage)(w, r)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/api/medias/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/api/medias/" {
			if r.Method == http.MethodGet {
				handler.GetAll(w, r)
			} else if r.Method == http.MethodPost {
				middlewares.RequireAuth(handler.UploadImage)(w, r)
			} else {
				http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			}
			return
		}

		if r.URL.Path == "/api/medias/upload" {
			if r.Method == http.MethodPost {
				middlewares.RequireAuth(handler.UploadImage)(w, r)
			} else {
				http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			}
			return
		}

		if r.Method == http.MethodGet {
			handler.GetById(w, r)
		} else {
			http.Error(w, "Not found", http.StatusNotFound)
		}
	})

	corsHandler := func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}
			next.ServeHTTP(w, r)
		})
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "3004"
	}

	log.Printf("Starting media-service-v2 on port %s", port)
	if err := http.ListenAndServe(":"+port, corsHandler(mux)); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
