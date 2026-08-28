package com.devflow.user_service.kafka;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.devflow.user_service.metrics.UserMetrics;
import com.devflow.user_service.model.Role;
import com.devflow.user_service.model.User;
import com.devflow.user_service.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserKafkaConsumer {

    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final UserMetrics userMetrics;

    @KafkaListener(topics = "user-registered", groupId = "user-service-group", containerFactory = "kafkaListenerContainerFactory")
    @Transactional
    public void handleUserRegistered(String message) {
        log.info("Received Kafka event [user-registered]: {}", message);

        try {
            JsonNode root = objectMapper.readTree(message);
            JsonNode payload = root.has("payload") ? root.get("payload") : root;

            String userId = payload.path("userId").asText(null);
            String email = payload.path("email").asText(null);
            String fullName = payload.path("fullName").asText("Developer");
            String avatarUrl = payload.path("avatarUrl").asText("https://api.dicebear.com/7.x/avataaars/svg?seed=" + email);

            if (userId == null || email == null) {
                log.warn("Skipping invalid user-registered event (missing userId or email)");
                return;
            }

            // Check if user already exists by ID or Email
            if (userRepository.existsById(userId) || userRepository.findByEmail(email).isPresent()) {
                log.info("User with id {} or email {} already exists. Skipping creation.", userId, email);
                return;
            }

            User user = User.builder()
                    .id(userId)
                    .email(email)
                    .fullName(fullName)
                    .avatarUrl(avatarUrl)
                    .reputation(10) // 10 starter reputation
                    .role(Role.USER)
                    .isLookingForWork(false)
                    .build();

            userRepository.save(user);
            userMetrics.incrementRegisteredUsers();
            log.info("Successfully initialized developer profile for user: {} ({})", fullName, email);

        } catch (JsonProcessingException e) {
            log.error("Failed to process user-registered Kafka event: {}", e.getMessage(), e);
        }
    }
}

