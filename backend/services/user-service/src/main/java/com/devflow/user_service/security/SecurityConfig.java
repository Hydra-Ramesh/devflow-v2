package com.devflow.user_service.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(AbstractHttpConfigurer::disable) // CORS is handled centrally at the API Gateway
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Authenticated user endpoints (must come before wildcard {id})
                .requestMatchers(
                    "/api/users/profile",
                    "/api/v1/users/profile",
                    "/api/users/me",
                    "/api/v1/users/me",
                    "/api/users/bookmarks",
                    "/api/v1/users/bookmarks",
                    "/api/users/bookmark",
                    "/api/v1/users/bookmark",
                    "/api/talent/profile",
                    "/api/v1/talent/profile"
                ).authenticated()

                // Public endpoints
                .requestMatchers(
                    "/actuator/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/v3/api-docs/**",
                    "/error"
                ).permitAll()
                .requestMatchers(HttpMethod.GET, "/api/users", "/api/v1/users").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/users/leaderboard", "/api/v1/users/leaderboard").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/talent", "/api/v1/talent").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/users/{id}", "/api/v1/users/{id}").permitAll()

                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

