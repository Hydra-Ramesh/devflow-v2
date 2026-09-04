package config

import (
	"log"
	"os"

	"github.com/cloudinary/cloudinary-go/v2"
)

var CloudinaryClient *cloudinary.Cloudinary

func InitCloudinary() {
	cloudName := os.Getenv("CLOUDINARY_CLOUD_NAME")
	apiKey := os.Getenv("CLOUDINARY_API_KEY")
	apiSecret := os.Getenv("CLOUDINARY_API_SECRET")

	if cloudName == "" || apiKey == "" || apiSecret == "" {
		log.Println("WARNING: Cloudinary credentials missing from environment")
		return
	}

	cld, err := cloudinary.NewFromParams(cloudName, apiKey, apiSecret)
	if err != nil {
		log.Fatalf("Failed to initialize Cloudinary: %v", err)
	}

	CloudinaryClient = cld
	log.Println("Cloudinary initialized successfully")
}
