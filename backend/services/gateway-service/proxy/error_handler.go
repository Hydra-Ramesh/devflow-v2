package proxy

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/Hydra-Ramesh/devflow-v2/backend/services/gateway-service/log"
	"github.com/Hydra-Ramesh/devflow-v2/backend/services/gateway-service/middleware"
	"github.com/Hydra-Ramesh/devflow-v2/backend/services/gateway-service/res"
)

func NewErrorHandler(targetURLStr string) func(http.ResponseWriter, *http.Request, error) {
	return func(w http.ResponseWriter, r *http.Request, err error) {
		if err == context.Canceled {
			return
		}

		corrID := r.Header.Get(middleware.CorrelationIDHeader)
		log.Error(corrID, "Proxy failure for upstream target [%s]: %v", targetURLStr, err)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadGateway)

		resp := res.StandardResponse{
			Success:   false,
			Status:    "error",
			Message:   "Downstream service is currently unavailable. Please try again in a few moments.",
			TraceID:   corrID,
			Timestamp: time.Now().UTC().Format(time.RFC3339),
		}

		_ = json.NewEncoder(w).Encode(resp)
	}
}
