package com.devflow.auth_service.service;

import com.devflow.auth_service.config.KafkaConfig;
import com.devflow.auth_service.dto.AuthRequest;
import com.devflow.auth_service.dto.AuthResponse;
import com.devflow.auth_service.exception.BadRequestException;
import com.devflow.auth_service.exception.UnauthorizedException;
import com.devflow.auth_service.model.UserAuth;
import com.devflow.auth_service.repository.UserAuthRepository;
import com.devflow.auth_service.security.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserAuthRepository userAuthRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final StringRedisTemplate redisTemplate;
    private final KafkaConfig kafkaConfig;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public AuthService(UserAuthRepository userAuthRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil, StringRedisTemplate redisTemplate, KafkaConfig kafkaConfig) {
        this.userAuthRepository = userAuthRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.redisTemplate = redisTemplate;
        this.kafkaConfig = kafkaConfig;
    }

    private String createSession(UserAuth user, String ip, String userAgent) {
        String sessionId = UUID.randomUUID().toString();
        // Fallbacks for UA Parser logic
        String os = "Unknown OS";
        String browser = "Unknown Browser";
        String device = "Desktop";

        // Store session in Redis for 7 days
        String sessionKey = "user:" + user.getId() + ":session:" + sessionId;
        redisTemplate.opsForValue().set(sessionKey, "{\"id\":\"" + sessionId + "\", \"ip\":\"" + ip + "\"}", Duration.ofDays(7));

        // Fire new login event
        if (user.getEmail() != null) {
            Map<String, Object> payload = new HashMap<>();
            payload.put("email", user.getEmail());
            payload.put("name", "User");
            payload.put("device", device);
            payload.put("os", os);
            payload.put("browser", browser);
            payload.put("ip", ip);
            payload.put("time", LocalDateTime.now().toString());

            kafkaConfig.publishEvent("email-new-login", user.getId(), payload);
        }

        return sessionId;
    }

    public AuthResponse.AuthData register(AuthRequest req, String ip, String userAgent) {
        log.info("Attempting to register new user: {}", req.getEmail());

        if (userAuthRepository.findByEmail(req.getEmail()).isPresent()) {
            log.warn("Registration failed: Email already exists - {}", req.getEmail());
            throw new BadRequestException("Email is already in use");
        }

        UserAuth user = new UserAuth();
        user.setEmail(req.getEmail());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        
        user = userAuthRepository.save(user);

        String sessionId = createSession(user, ip, userAgent);
        String token = jwtUtil.generateToken(user.getId(), sessionId);

        String defaultAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=" + req.getEmail();

        // Cross-domain choreographies
        Map<String, Object> userPayload = new HashMap<>();
        userPayload.put("userId", user.getId());
        userPayload.put("email", user.getEmail());
        userPayload.put("fullName", req.getFullName());
        userPayload.put("avatarUrl", defaultAvatar);
        userPayload.put("timestamp", LocalDateTime.now().toString());
        kafkaConfig.publishEvent("user-registered", user.getId(), userPayload);

        Map<String, Object> emailPayload = new HashMap<>();
        emailPayload.put("email", user.getEmail());
        emailPayload.put("name", req.getFullName());
        kafkaConfig.publishEvent("email-welcome", user.getId(), emailPayload);

        Map<String, Object> aiPayload = new HashMap<>();
        aiPayload.put("id", user.getId());
        aiPayload.put("email", user.getEmail());
        aiPayload.put("fullName", req.getFullName());
        kafkaConfig.publishEvent("user-index", user.getId(), aiPayload);

        log.info("User registered successfully. ID: {}", user.getId());
        return new AuthResponse.AuthData(new AuthResponse.UserDto(user.getId(), user.getEmail()), token);
    }

    public AuthResponse.AuthData login(AuthRequest req, String ip, String userAgent) {
        log.info("Attempting login for user: {}", req.getEmail());

        UserAuth user = userAuthRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> {
                    log.warn("Login failed: User not found - {}", req.getEmail());
                    return new UnauthorizedException("Invalid credentials");
                });

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            log.warn("Login failed: Invalid password - {}", req.getEmail());
            throw new UnauthorizedException("Invalid credentials");
        }

        log.info("User logged in successfully. ID: {}", user.getId());

        String sessionId = createSession(user, ip, userAgent);
        String token = jwtUtil.generateToken(user.getId(), sessionId);

        return new AuthResponse.AuthData(new AuthResponse.UserDto(user.getId(), user.getEmail()), token);
    }

    public void forgotPassword(String email) {
        userAuthRepository.findByEmail(email).ifPresent(user -> {
            String secret = jwtUtil.getSecret() + user.getPasswordHash();
            String token = jwtUtil.generateTokenWithSecret(user.getEmail(), user.getId(), secret, 15 * 60 * 1000); // 15 mins
            
            String resetLink = frontendUrl + "/reset-password?token=" + token + "&id=" + user.getId();
            
            Map<String, Object> payload = new HashMap<>();
            payload.put("email", user.getEmail());
            payload.put("resetLink", resetLink);
            
            kafkaConfig.publishEvent("email-password-reset", user.getId(), payload);
        });
    }

    @Transactional
    public void resetPassword(String userId, String token, String newPassword) {
        UserAuth user = userAuthRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("Invalid or expired token"));

        String secret = jwtUtil.getSecret() + user.getPasswordHash();
        try {
            jwtUtil.verifyTokenWithSecret(token, secret);
        } catch (Exception e) {
            throw new BadRequestException("Invalid or expired token");
        }

        userAuthRepository.updatePassword(userId, passwordEncoder.encode(newPassword));
    }

    public List<String> getSessions(String userId) {
        Set<String> keys = redisTemplate.keys("user:" + userId + ":session:*");
        if (keys == null || keys.isEmpty()) return Collections.emptyList();
        
        return redisTemplate.opsForValue().multiGet(keys);
    }

    public void revokeSession(String userId, String sessionId) {
        redisTemplate.delete("user:" + userId + ":session:" + sessionId);
    }
}
