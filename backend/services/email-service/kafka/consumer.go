package kafka

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"github.com/Hydra-Ramesh/devflow-v2/backend/services/email-service/config"
	"github.com/Hydra-Ramesh/devflow-v2/backend/services/email-service/mail"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/segmentio/kafka-go"
)

var (
	eventsConsumed = promauto.NewCounterVec(prometheus.CounterOpts{
		Name: "devflow_email_events_consumed_total",
		Help: "Total number of kafka events consumed by email-service",
	}, []string{"topic"})

	emailsSent = promauto.NewCounterVec(prometheus.CounterOpts{
		Name: "devflow_emails_sent_total",
		Help: "Total number of emails attempted to be sent",
	}, []string{"type"})
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

	go startListener(brokerList, "email-password-reset", "email-service-group", func(msg []byte) {
		var wrapper map[string]interface{}
		json.Unmarshal(msg, &wrapper)

		payload, ok := wrapper["payload"].(map[string]interface{})
		if !ok {
			payload = wrapper // fallback if not wrapped
		}

		email := getString(payload, "email")
		if email != "" {
			m.SendPasswordReset(email, getString(payload, "resetLink"))
		}
	})

	go startListener(brokerList, "email-new-login", "email-service-group", func(msg []byte) {
		var wrapper map[string]interface{}
		json.Unmarshal(msg, &wrapper)

		payload, ok := wrapper["payload"].(map[string]interface{})
		if !ok {
			payload = wrapper
		}

		m.SendNewLogin(
			getString(payload, "email"), getString(payload, "name"),
			getString(payload, "device"), getString(payload, "os"),
			getString(payload, "browser"), getString(payload, "ip"),
			getString(payload, "time"),
		)
	})

	go startListener(brokerList, "email-welcome", "email-service-group", func(msg []byte) {
		var wrapper map[string]interface{}
		json.Unmarshal(msg, &wrapper)

		payload, ok := wrapper["payload"].(map[string]interface{})
		if !ok {
			payload = wrapper
		}

		email := getString(payload, "email")
		name := getString(payload, "name")
		if email != "" {
			m.SendWelcome(email, name)
			emailsSent.WithLabelValues("welcome").Inc()
		}
	})

	go startListener(brokerList, "answer-created", "email-service-group", func(msg []byte) {
		var wrapper map[string]interface{}
		json.Unmarshal(msg, &wrapper)

		payload, ok := wrapper["payload"].(map[string]interface{})
		if !ok {
			payload = wrapper
		}

		questionID := getString(payload, "questionId")
		authorID := getString(payload, "authorId")

		// Lookup questionAuthorId from Redis
		recipientID := getString(payload, "questionAuthorId")
		if recipientID == "" && questionID != "" {
			recipientID = config.GetEntityAuthor("question", questionID)
		}

		if recipientID != "" && recipientID != authorID {
			profile, err := config.GetUserProfile(recipientID)
			if err == nil && profile.Email != "" {
				m.SendAnswerNotification(profile.Email, profile.FullName, getString(payload, "questionTitle"), getString(payload, "link"))
				emailsSent.WithLabelValues("answer_notification").Inc()
			}
		}
	})

	go startListener(brokerList, "user-registered", "email-service-group", func(msg []byte) {
		var wrapper map[string]interface{}
		json.Unmarshal(msg, &wrapper)

		payload, ok := wrapper["payload"].(map[string]interface{})
		if !ok {
			payload = wrapper
		}

		userID := getString(payload, "id")
		email := getString(payload, "email")
		fullName := getString(payload, "fullName")

		if userID != "" && email != "" {
			config.SaveUserProfile(userID, email, fullName)
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
		eventsConsumed.WithLabelValues(topic).Inc()
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
