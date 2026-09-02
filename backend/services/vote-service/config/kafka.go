package config

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/segmentio/kafka-go"
)

var KafkaWriter *kafka.Writer

func ConnectKafka() {
	KafkaWriter = &kafka.Writer{
		Addr:         kafka.TCP(AppConfig.KafkaBroker),
		Balancer:     &kafka.LeastBytes{},
		BatchTimeout: 10 * time.Millisecond,
	}
	log.Println("Kafka Writer configured successfully")
}

func PublishEvent(topic string, key string, payload interface{}) error {
	data, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	err = KafkaWriter.WriteMessages(context.Background(),
		kafka.Message{
			Topic: topic,
			Key:   []byte(key),
			Value: data,
		},
	)
	if err != nil {
		log.Printf("Failed to publish event to %s: %v", topic, err)
		return err
	}
	log.Printf("Event published to %s: %s", topic, key)
	return nil
}
