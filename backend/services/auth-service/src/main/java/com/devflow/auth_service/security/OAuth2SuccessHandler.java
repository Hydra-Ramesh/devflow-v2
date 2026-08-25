package com.devflow.auth_service.security;

import com.devflow.auth_service.config.KafkaConfig;
import com.devflow.auth_service.model.UserAuth;
import com.devflow.auth_service.repository.UserAuthRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseCookie;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserAuthRepository userAuthRepository;
    private final JwtUtil jwtUtil;
    private final StringRedisTemplate redisTemplate;
    private final KafkaConfig kafkaConfig;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public OAuth2SuccessHandler(UserAuthRepository userAuthRepository, JwtUtil jwtUtil, StringRedisTemplate redisTemplate, KafkaConfig kafkaConfig) {
        this.userAuthRepository = userAuthRepository;
        this.jwtUtil = jwtUtil;
        this.redisTemplate = redisTemplate;
        this.kafkaConfig = kafkaConfig;
    }

    @Override
    @Transactional
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        // Sometimes GitHub doesn't return name or email directly in attributes
        if (email == null) {
            email = oAuth2User.getAttribute("login") + "@github.com"; // Fallback for testing
        }
        if (name == null) {
            name = oAuth2User.getAttribute("login");
        }

        Optional<UserAuth> existingUserOpt = userAuthRepository.findByEmail(email);
        UserAuth user;

        if (existingUserOpt.isPresent()) {
            user = existingUserOpt.get();
        } else {
            user = new UserAuth();
            user.setEmail(email);
            // Password is null for OAuth users
            user = userAuthRepository.save(user);

            // Kafka event for new user
            Map<String, Object> userPayload = new HashMap<>();
            userPayload.put("userId", user.getId());
            userPayload.put("email", user.getEmail());
            userPayload.put("fullName", name != null ? name : "OAuth User");
            userPayload.put("avatarUrl",
                    oAuth2User.getAttribute("avatar_url") != null ? oAuth2User.getAttribute("avatar_url")
                            : "https://api.dicebear.com/7.x/avataaars/svg?seed=" + email);
            userPayload.put("timestamp", LocalDateTime.now().toString());
            kafkaConfig.publishEvent("user-registered", user.getId(), userPayload);
        }

        String sessionId = UUID.randomUUID().toString();
        String sessionKey = "user:" + user.getId() + ":session:" + sessionId;
        String ip = request.getRemoteAddr();

        redisTemplate.opsForValue().set(sessionKey, "{\"id\":\"" + sessionId + "\", \"ip\":\"" + ip + "\"}", Duration.ofDays(7));

        String token = jwtUtil.generateToken(user.getId(), sessionId);

        ResponseCookie cookie = ResponseCookie.from("AUTH_TOKEN", token)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(604800)
                .sameSite("Lax")
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
        getRedirectStrategy().sendRedirect(request, response, frontendUrl + "/auth/callback");
    }
}
