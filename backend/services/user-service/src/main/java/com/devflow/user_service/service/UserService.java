package com.devflow.user_service.service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.devflow.user_service.audit.AuditProducer;
import com.devflow.user_service.config.KafkaConfig;
import com.devflow.user_service.dto.BadgeDTO;
import com.devflow.user_service.dto.BookmarkResponse;
import com.devflow.user_service.dto.LeaderboardUserResponse;
import com.devflow.user_service.dto.TalentUserResponse;
import com.devflow.user_service.dto.UpdateProfileRequest;
import com.devflow.user_service.dto.UpdateTalentRequest;
import com.devflow.user_service.dto.UserProfileResponse;
import com.devflow.user_service.dto.UserProfileWrapper;
import com.devflow.user_service.dto.UserSearchResponse;
import com.devflow.user_service.metrics.UserMetrics;
import com.devflow.user_service.model.Bookmark;
import com.devflow.user_service.model.User;
import com.devflow.user_service.repository.BookmarkRepository;
import com.devflow.user_service.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final BookmarkRepository bookmarkRepository;
    private final BadgeService badgeService;
    private final StringRedisTemplate redisTemplate;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final KafkaConfig kafkaConfig;
    private final ObjectMapper objectMapper;
    private final UserMetrics userMetrics;
    private final AuditProducer auditProducer;

    private long getJitteredTTL(long baseSeconds) {
        long jitter = ThreadLocalRandom.current().nextLong(-baseSeconds / 10, baseSeconds / 10 + 1);
        return Math.max(10, baseSeconds + jitter);
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getUserProfile(String id) {
        userMetrics.incrementProfileViews();
        String cacheKey = "user:profile:" + id;

        try {
            String cached = redisTemplate.opsForValue().get(cacheKey);
            if (cached != null) {
                return objectMapper.readValue(cached, UserProfileResponse.class);
            }
        } catch (com.fasterxml.jackson.core.JsonProcessingException |
                 org.springframework.dao.DataAccessException e) {
            log.warn("Redis read failed for key {}: {}", cacheKey, e.getMessage());
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User profile not found with id: " + id));

        long bookmarkCount = bookmarkRepository.countByUserId(id);
        List<BadgeDTO> badges = badgeService.calculateBadges(user.getReputation(), 0L, 0L);

        Map<String, Object> stats = new HashMap<>();
        stats.put("reputation", user.getReputation());
        stats.put("bookmarks", bookmarkCount);
        stats.put("questions", 0);
        stats.put("answers", 0);

        UserProfileResponse response = UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .designation(user.getDesignation())
                .company(user.getCompany())
                .linkedinUrl(user.getLinkedinUrl())
                .githubUrl(user.getGithubUrl())
                .portfolioUrl(user.getPortfolioUrl())
                .reputation(user.getReputation())
                .role(user.getRole())
                .isLookingForWork(user.getIsLookingForWork())
                .resumeUrl(user.getResumeUrl())
                .preferredRoles(user.getPreferredRoles() != null ? Arrays.asList(user.getPreferredRoles()) : new ArrayList<>())
                .yearsOfExperience(user.getYearsOfExperience())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .badges(badges)
                .stats(stats)
                .build();

        try {
            long ttl = getJitteredTTL(300);
            redisTemplate.opsForValue().set(cacheKey, objectMapper.writeValueAsString(response), Duration.ofSeconds(ttl));
        } catch (com.fasterxml.jackson.core.JsonProcessingException |
                 org.springframework.dao.DataAccessException e) {
            log.warn("Redis write failed for key {}: {}", cacheKey, e.getMessage());
        }

        return response;
    }

    @Transactional(readOnly = true)
    public UserProfileWrapper getUserProfileWrapper(String id) {
        UserProfileResponse profile = getUserProfile(id);
        return UserProfileWrapper.builder()
                .profile(profile)
                .recentQuestions(new ArrayList<>())
                .allQuestions(new ArrayList<>())
                .build();
    }

    @Transactional
    public UserProfileWrapper updateProfile(String userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getDesignation() != null) {
            user.setDesignation(request.getDesignation().trim());
        }
        if (request.getCompany() != null) {
            user.setCompany(request.getCompany().trim());
        }
        if (request.getAvatarUrl() != null && !request.getAvatarUrl().isBlank()) {
            user.setAvatarUrl(request.getAvatarUrl().trim());
        }
        if (request.getLinkedinUrl() != null) {
            user.setLinkedinUrl(request.getLinkedinUrl().trim());
        }
        if (request.getGithubUrl() != null) {
            user.setGithubUrl(request.getGithubUrl().trim());
        }
        if (request.getPortfolioUrl() != null) {
            user.setPortfolioUrl(request.getPortfolioUrl().trim());
        }

        User updatedUser = userRepository.save(user);


        try {
            redisTemplate.delete("user:profile:" + userId);
            redisTemplate.delete("auth:user:" + userId);
        } catch (Exception e) {
            log.warn("Redis cache eviction failed: {}", e.getMessage());
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("userId", updatedUser.getId());
        payload.put("fullName", updatedUser.getFullName());
        payload.put("designation", updatedUser.getDesignation());
        payload.put("company", updatedUser.getCompany());
        kafkaConfig.publishEvent(kafkaTemplate, "user-index", updatedUser.getId(), payload);


        auditProducer.logAction(userId, "USER_PROFILE_UPDATED", payload);

        return getUserProfileWrapper(userId);
    }

    @Transactional
    public UserProfileWrapper updateTalentStatus(String userId, UpdateTalentRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (request.getIsLookingForWork() != null) {
            user.setIsLookingForWork(request.getIsLookingForWork());
        }
        if (request.getResumeUrl() != null) {
            user.setResumeUrl(request.getResumeUrl().trim());
        }
        if (request.getYearsOfExperience() != null) {
            user.setYearsOfExperience(request.getYearsOfExperience());
        }
        if (request.getPreferredRoles() != null) {
            user.setPreferredRoles(request.getPreferredRoles().toArray(String[]::new));
        }
        if (request.getLinkedinUrl() != null) {
            user.setLinkedinUrl(request.getLinkedinUrl().trim());
        }
        if (request.getGithubUrl() != null) {
            user.setGithubUrl(request.getGithubUrl().trim());
        }
        if (request.getPortfolioUrl() != null) {
            user.setPortfolioUrl(request.getPortfolioUrl().trim());
        }

        userRepository.save(user);

        try {
            redisTemplate.delete("user:profile:" + userId);
        } catch (Exception e) {
            log.warn("Redis cache eviction failed: {}", e.getMessage());
        }

        Map<String, Object> auditDetails = new HashMap<>();
        auditDetails.put("isLookingForWork", user.getIsLookingForWork());
        auditDetails.put("yearsOfExperience", user.getYearsOfExperience());
        auditProducer.logAction(userId, "USER_TALENT_STATUS_UPDATED", auditDetails);

        return getUserProfileWrapper(userId);
    }

    @Transactional(readOnly = true)
    public List<TalentUserResponse> getTalent(String skills, int page, int limit) {
        Pageable pageable = PageRequest.of(Math.max(0, page - 1), normalizeLimit(limit));
        String skillQuery = skills == null ? "" : skills.trim();
        Page<User> talentPage = skillQuery.isEmpty()
            ? userRepository.findTalent(pageable)
            : userRepository.findTalentBySkills(skillQuery, pageable);

        return talentPage.getContent().stream().map(u -> TalentUserResponse.builder()
                .id(u.getId())
                .fullName(u.getFullName())
                .avatarUrl(u.getAvatarUrl())
                .designation(u.getDesignation())
                .company(u.getCompany())
                .reputation(u.getReputation())
                .isLookingForWork(u.getIsLookingForWork())
                .resumeUrl(u.getResumeUrl())
                .yearsOfExperience(Optional.ofNullable(u.getYearsOfExperience()).orElse(0))
                .preferredRoles(u.getPreferredRoles() != null ? Arrays.asList(u.getPreferredRoles()) : new ArrayList<>())
                .githubUrl(u.getGithubUrl())
                .linkedinUrl(u.getLinkedinUrl())
                .portfolioUrl(u.getPortfolioUrl())
                .badges(badgeService.calculateBadges(u.getReputation(), 0L, 0L))
                .build()
        ).collect(Collectors.toList());
    }

    @Transactional
    public BookmarkResponse toggleBookmark(String userId, String questionId) {
        userMetrics.incrementBookmarksToggled();
        Optional<Bookmark> existingOpt = bookmarkRepository.findByUserIdAndQuestionId(userId, questionId);

        Map<String, Object> auditData = new HashMap<>();
        auditData.put("questionId", questionId);

        if (existingOpt.isPresent()) {
            bookmarkRepository.delete(existingOpt.get());
            try {
                redisTemplate.delete("user:bookmarks:" + userId);
            } catch (Exception ignored) {}

            auditData.put("bookmarked", false);
            auditProducer.logAction(userId, "BOOKMARK_REMOVED", auditData);

            return new BookmarkResponse("Bookmark removed", false, questionId);
        } else {
            Bookmark bookmark = Bookmark.builder()
                    .userId(userId)
                    .questionId(questionId)
                    .build();
            bookmarkRepository.save(bookmark);
            try {
                redisTemplate.delete("user:bookmarks:" + userId);
            } catch (Exception ignored) {}

            auditData.put("bookmarked", true);
            auditProducer.logAction(userId, "BOOKMARK_ADDED", auditData);

            return new BookmarkResponse("Bookmark added", true, questionId);
        }
    }

    @Transactional(readOnly = true)
    public List<Bookmark> getUserBookmarks(String userId) {
        return bookmarkRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<LeaderboardUserResponse> getLeaderboard(int page, int limit) {
        String cacheKey = "leaderboard:page:" + page + ":limit:" + limit;

        try {
            String cached = redisTemplate.opsForValue().get(cacheKey);
            if (cached != null) {
                return objectMapper.readValue(cached, objectMapper.getTypeFactory().constructCollectionType(List.class, LeaderboardUserResponse.class));
            }
        } catch (JsonProcessingException | DataAccessException ignored) {}

        Pageable pageable = PageRequest.of(Math.max(0, page - 1), normalizeLimit(limit));
        Page<User> userPage = userRepository.findLeaderboard(pageable);

        List<LeaderboardUserResponse> leaderboard = userPage.getContent().stream().map(u -> LeaderboardUserResponse.builder()
                .id(u.getId())
                .fullName(u.getFullName())
                .avatarUrl(u.getAvatarUrl())
                .designation(u.getDesignation())
                .company(u.getCompany())
                .reputation(u.getReputation())
                .badges(badgeService.calculateBadges(u.getReputation(), 0L, 0L))
                .build()
        ).collect(Collectors.toList());

        try {
            long ttl = getJitteredTTL(300);
            redisTemplate.opsForValue().set(cacheKey, objectMapper.writeValueAsString(leaderboard), Duration.ofSeconds(ttl));
        } catch (JsonProcessingException | DataAccessException ignored) {}

        return leaderboard;
    }

    @Transactional(readOnly = true)
    public UserSearchResponse searchUsers(String query, int page, int limit) {
        Pageable pageable = PageRequest.of(Math.max(0, page - 1), normalizeLimit(limit));
        Page<User> userPage = userRepository.searchUsers(query, pageable);

        List<LeaderboardUserResponse> users = userPage.getContent().stream().map(u -> LeaderboardUserResponse.builder()
                .id(u.getId())
                .fullName(u.getFullName())
                .avatarUrl(u.getAvatarUrl())
                .designation(u.getDesignation())
                .company(u.getCompany())
                .reputation(u.getReputation())
                .badges(badgeService.calculateBadges(u.getReputation(), 0L, 0L))
                .build()
        ).collect(Collectors.toList());

        return UserSearchResponse.builder()
                .users(users)
                .total(userPage.getTotalElements())
                .page(page)
                .totalPages(userPage.getTotalPages())
                .build();
    }

    private int normalizeLimit(int limit) {
        return Math.min(Math.max(limit, 1), 100);
    }
}
