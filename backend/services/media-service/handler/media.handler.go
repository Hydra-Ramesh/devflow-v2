package handler

import (
	"encoding/json"
	"net/http"

	"github.com/Hydra-Ramesh/devflow-v2/backend/services/media-service/config"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

type Response struct {
	Status  string      `json:"status"`
	Message string      `json:"message,omitempty"`
	URL     string      `json:"url,omitempty"`
	Data    interface{} `json:"data,omitempty"`
}

func GetAll(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(Response{
		Status: "success",
		Data:   []interface{}{},
	})
}

func GetById(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(Response{
		Status: "success",
		Data:   map[string]interface{}{},
	})
}

func UploadImage(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	if err := r.ParseMultipartForm(10 << 20); err != nil {
		http.Error(w, `{"status":"error","message":"File too large"}`, http.StatusBadRequest)
		return
	}

	file, _, err := r.FormFile("image")
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "No image provided",
		})
		return
	}
	defer file.Close()

	if config.CloudinaryClient == nil {
		http.Error(w, `{"status":"error","message":"Cloudinary not configured"}`, http.StatusInternalServerError)
		return
	}

	resp, err := config.CloudinaryClient.Upload.Upload(r.Context(), file, uploader.UploadParams{
		Folder: "devflow_avatars",
	})

	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Failed to upload image",
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(Response{
		Status:  "success",
		Message: "Image uploaded successfully",
		URL:     resp.SecureURL,
	})
}
