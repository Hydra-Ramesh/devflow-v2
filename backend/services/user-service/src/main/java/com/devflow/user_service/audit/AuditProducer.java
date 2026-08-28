package com.devflow.user_service.audit;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import com.devflow.user_service.config.KafkaConfig;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuditProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final KafkaConfig kafkaConfig;

    public void logAction(String userId, String action, Map<String, Object> details) {
        try {
            Map<String, Object> auditPayload = new HashMap<>();
            auditPayload.put("auditId", UUID.randomUUID().toString());
            auditPayload.put("userId", userId);
            auditPayload.put("action", action);
            auditPayload.put("service", "user-service-v2");
            auditPayload.put("details", details != null ? details : new HashMap<>());
            auditPayload.put("timestamp", new Date().toString());

            kafkaConfig.publishEvent(kafkaTemplate, "audit-events", userId, auditPayload);
            log.debug("Audit event emitted: {} by {}", action, userId);
        } catch (Exception e) {
            log.warn("Failed to publish audit event: {}", e.getMessage());
        }
    }
}
