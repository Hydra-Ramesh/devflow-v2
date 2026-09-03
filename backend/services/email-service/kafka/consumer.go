package kafka

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"github.com/Hydra-Ramesh/devflow-v2/backend/services/email-service/config"
	"github.com/Hydra-Ramesh/devflow-v2/backend/services/email-service/mail"

	"github.com/segmentio/kafka-go"
)

var consumers []*kafka.Reader

type EventWrapper struct {
	Type    string                 `json:"type"`
	Payload map[string]interface{} `json:"payload"`
}

func StartConsumers() {
	brokers := os.Getenv("KAFKA_BROKERS")
	if brokers == "" {
		brokers = "localhost:9092"
	}
	brokerList := strings.Split(brokers, ",")
	m := mail.NewMailer()

	go startListener(brokerList, "email-events", "email-service-group", func(msg []byte) {
		var event EventWrapper
		if err := json.Unmarshal(msg, &event); err != nil {
			json.Unmarshal(msg, &event.Payload)
		}

		payload := event.Payload
		if payload == nil {
			json.Unmarshal(msg, &payload)
		}

		email := getString(payload, "email")
		name := getString(payload, "name")

		switch event.Type {
		case "password-reset":
			m.SendPasswordReset(email, getString(payload, "resetLink"))
		case "new-login":
			m.SendNewLogin(
				email, name,
				getString(payload, "device"),
				getString(payload, "os"),
				getString(payload, "browser"),
				getString(payload, "ip"),
				getString(payload, "time"),
			)
		case "welcome":
			m.SendWelcome(email, name)
		case "achievement":
			m.SendAchievement(email, name, getInt(payload, "reputation"))
		}
	})

	go startListener(brokerList, "answer-created", "email-service-group", func(msg []byte) {
		var payload map[string]interface{}
		json.Unmarshal(msg, &payload)

		recipientID := getString(payload, "questionAuthorId")
		authorID := getString(payload, "authorId")

		if recipientID != "" && recipientID != authorID {
			profile, err := config.GetUserProfile(recipientID)
			if err == nil && profile.Email != "" {
				m.SendAnswerNotification(profile.Email, profile.FullName, getString(payload, "questionTitle"), getString(payload, "link"))
			}
		}
	})

	go startListener(brokerList, "user-created", "email-service-group", func(msg []byte) {
		var payload map[string]interface{}
		json.Unmarshal(msg, &payload)

		userID := getString(payload, "id")
		email := getString(payload, "email")
		fullName := getString(payload, "fullName")

		if userID != "" && email != "" {
			config.SaveUserProfile(userID, email, fullName)
			m.SendWelcome(email, fullName)
		}
	})

	go startListener(brokerList, "user-updated", "email-service-group", func(msg []byte) {
		var payload map[string]interface{}
		json.Unmarshal(msg, &payload)

		userID := getString(payload, "id")
		email := getString(payload, "email")
		fullName := getString(payload, "fullName")

		if userID != "" {
			config.SaveUserProfile(userID, email, fullName)
		}
	})

	fmt.Println("Kafka Consumers started Email Service")
}

func startListener(brokers []string, topic, groupID string, handler func([]byte)) {
	r := kafka.NewReader(kafka.ReaderConfig{
		Brokers: brokers,
		GroupID: groupID,
		Topic:   topic,
	})
	consumers = append(consumers, r)

	for {
		m, err := r.ReadMessage(context.Background())
		if err != nil {
			break
		}
		handler(m.Value)
	}
}

func DisconnectKafka() {
	for _, c := range consumers {
		c.Close()
	}
	fmt.Println("Kafka Consumers disconnected")
}

func getString(m map[string]interface{}, key string) string {
	if val, ok := m[key]; ok && val != nil {
		return fmt.Sprintf("%v", val)
	}
	return ""
}

func getInt(m map[string]interface{}, key string) int {
	if val, ok := m[key]; ok && val != nil {
		switch v := val.(type) {
		case int:
			return v
		case float64:
			return int(v)
		}
	}
	return 0
}
