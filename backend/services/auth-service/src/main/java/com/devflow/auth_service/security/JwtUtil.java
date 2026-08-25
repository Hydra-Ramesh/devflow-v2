package com.devflow.auth_service.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    @Value("${spring.jwt.secret}")
    private String secret;

    @Value("${spring.jwt.expiration}")
    private long expirationTime;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(String userId, String sessionId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", userId);
        claims.put("sid", sessionId);

        return Jwts.builder()
                .claims(claims)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(getSigningKey(), Jwts.SIG.HS256)
                .compact();
    }

    public String getSecret() {
        return this.secret;
    }

    public String generateTokenWithSecret(String email, String userId, String customSecret, long customExpiration) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", email);
        claims.put("id", userId);

        SecretKey key = Keys.hmacShaKeyFor(customSecret.getBytes());

        return Jwts.builder()
                .claims(claims)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + customExpiration))
                .signWith(key, Jwts.SIG.HS256)
                .compact();
    }

    public void verifyTokenWithSecret(String token, String customSecret) {
        SecretKey key = Keys.hmacShaKeyFor(customSecret.getBytes());
        Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
    }
}
