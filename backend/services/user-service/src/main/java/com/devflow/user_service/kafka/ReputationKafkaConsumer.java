package com.devflow.user_service.kafka;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.devflow.user_service.config.KafkaConfig;
import com.devflow.user_service.dto.BadgeDTO;
import com.devflow.user_service.repository.UserRepository;
import com.devflow.user_service.service.BadgeService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class ReputationKafkaConsumer {

    private final UserRepository userRepository;
    private final BadgeService badgeService;
    private final StringRedisTemplate redisTemplate;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final KafkaConfig kafkaConfig;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = {"vote-cast", "answer-accepted"}, groupId = "user-service-reputation-group", containerFactory = "kafkaListenerContainerFactory")
    @Transactional
    public void handleReputationEvent(String message) {
        log.info("Processing Reputation Kafka Event: {}", message);

        try {
            JsonNode root = objectMapper.readTree(message);
            String eventType = root.path("eventType").asText("");
            JsonNode payload = root.has("payload") ? root.get("payload") : root;

            String targetUserId = null;
            int reputationDelta = 0;

            if ("vote-cast".equals(eventType) || root.has("targetAuthorId")) {
                targetUserId = payload.path("targetAuthorId").asText(null);
                int voteValue = payload.path("value").asInt(1);
                reputationDelta = (voteValue > 0) ? 10 : -2;
            } else if ("answer-accepted".equals(eventType) || root.has("answerAuthorId")) {
                targetUserId = payload.path("answerAuthorId").asText(null);
                reputationDelta = 15;
            }

            if (targetUserId == null) {
                log.warn("Skipping reputation event with null targetUserId");
                return;
            }

            final int delta = reputationDelta;
            final String userId = targetUserId;

            userRepository.findById(userId).ifPresent(user -> {
                int oldRep = user.getReputation();
                int newRep = Math.max(0, oldRep + delta);
                user.setReputation(newRep);
                userRepository.save(user);

                log.info("Updated reputation for user {}: {} -> {} (delta: {})", userId, oldRep, newRep, delta);

                try {
                    redisTemplate.delete("user:profile:" + userId);
                } catch (Exception ignored) {}
                if ((oldRep < 100 && newRep >= 100) || (oldRep < 1000 && newRep >= 1000)) {
                    List<BadgeDTO> badges = badgeService.calculateBadges(newRep, 0L, 0L);
                    Map<String, Object> badgeEvent = new HashMap<>();
                    badgeEvent.put("userId", userId);
                    badgeEvent.put("reputation", newRep);
                    badgeEvent.put("badges", badges);
                    kafkaConfig.publishEvent(kafkaTemplate, "user-badge-unlocked", userId, badgeEvent);
                    log.info("🚀 Milestone reached for user {}! Published 'user-badge-unlocked'", userId);
                }
            });

        } catch (JsonProcessingException | RuntimeException e) {
            log.error("Failed to process reputation event: {}", e.getMessage(), e);
        }
    }
}