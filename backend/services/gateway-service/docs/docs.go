package docs

import "github.com/swaggo/swag"

const docTemplate = `{
  "swagger": "2.0",
  "info": {
    "title": "DevFlow API Gateway",
    "description": "Centralized High-Performance API Gateway for DevFlow Microservices Platform.",
    "termsOfService": "https://devflow.io/terms",
    "contact": {
      "name": "DevFlow Engineering Team",
      "email": "engineering@devflow.io"
    },
    "license": {
      "name": "Apache 2.0",
      "url": "http://www.apache.org/licenses/LICENSE-2.0.html"
    },
    "version": "2.0.0"
  },
  "host": "localhost:5000",
  "basePath": "/",
  "schemes": [
    "http",
    "https"
  ],
  "securityDefinitions": {
    "BearerAuth": {
      "type": "apiKey",
      "name": "Authorization",
      "in": "header",
      "description": "Enter your JWT token with the Bearer prefix: Bearer <JWT_TOKEN>"
    }
  },
  "paths": {
    "/health": {
      "get": {
        "tags": ["System"],
        "summary": "Gateway Health Check",
        "description": "Returns operational telemetry, uptime, and gateway status.",
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Gateway is operational",
            "schema": {
              "$ref": "#/definitions/StandardResponse"
            }
          }
        }
      }
    },
    "/metrics": {
      "get": {
        "tags": ["System"],
        "summary": "Prometheus Metrics Exporter",
        "description": "Scrapes real-time gateway metrics for Prometheus.",
        "produces": ["text/plain"],
        "responses": {
          "200": {
            "description": "Prometheus text metrics format"
          }
        }
      }
    },
    "/api/auth/register": {
      "post": {
        "tags": ["Authentication (Java Spring Boot)"],
        "summary": "Register a new user",
        "description": "Creates a new user record, hashes password, stores session in Redis, and emits Kafka user-registered event.",
        "consumes": ["application/json"],
        "produces": ["application/json"],
        "parameters": [
          {
            "in": "body",
            "name": "body",
            "description": "Registration payload",
            "required": true,
            "schema": {
              "$ref": "#/definitions/RegisterRequest"
            }
          }
        ],
        "responses": {
          "201": {
            "description": "User created successfully with token"
          },
          "400": {
            "description": "Validation error or email already taken"
          }
        }
      }
    },
    "/api/auth/login": {
      "post": {
        "tags": ["Authentication (Java Spring Boot)"],
        "summary": "User Login",
        "description": "Authenticates user credentials, generates 7-day Redis session and signs JWT token.",
        "consumes": ["application/json"],
        "produces": ["application/json"],
        "parameters": [
          {
            "in": "body",
            "name": "body",
            "description": "Login credentials",
            "required": true,
            "schema": {
              "$ref": "#/definitions/LoginRequest"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Login successful"
          },
          "401": {
            "description": "Invalid credentials"
          }
        }
      }
    },
    "/api/auth/me": {
      "get": {
        "tags": ["Authentication (Java Spring Boot)"],
        "summary": "Get Current Authenticated User",
        "description": "Returns session user metadata for the active JWT token.",
        "security": [
          {
            "BearerAuth": []
          }
        ],
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "User details"
          },
          "401": {
            "description": "Unauthorized"
          }
        }
      }
    },
  }
}`

var SwaggerInfo = &swag.Spec{
	Version:          "2.0.0",
	Host:             "localhost:5000",
	BasePath:         "/",
	Schemes:          []string{"http", "https"},
	Title:            "DevFlow API Gateway v2",
	Description:      "Centralized High-Performance API Gateway for DevFlow Microservices Platform.",
	InfoInstanceName: "swagger",
	SwaggerTemplate:  docTemplate,
	LeftDelim:        "{{",
	RightDelim:       "}}",
}

func init() {
	swag.Register(SwaggerInfo.InstanceName(), SwaggerInfo)
}
