package com.devflow.auth_service.config;

import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.support.serializer.JacksonJsonSerializer;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Configuration
public class KafkaConfig {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public KafkaConfig(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishEvent(String topic, String key, Map<String, Object> payload) {
        Map<String, Object> eventMessage = new HashMap<>();
        eventMessage.put("eventId", UUID.randomUUID().toString());
        eventMessage.put("timestamp", new java.util.Date().toString());
        eventMessage.put("eventType", topic);
        eventMessage.put("payload", payload);

        kafkaTemplate.send(topic, key != null ? key : UUID.randomUUID().toString(), eventMessage);
    }
}

@Configuration
class KafkaProducerConfiguration {
    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Bean
    public ProducerFactory<String, Object> producerFactory() {
        Map<String, Object> properties = new HashMap<>();
        properties.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        properties.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        properties.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JacksonJsonSerializer.class);
        return new DefaultKafkaProducerFactory<>(properties);
    }

    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate(ProducerFactory<String, Object> producerFactory) {
        return new KafkaTemplate<>(producerFactory);
    }
}
