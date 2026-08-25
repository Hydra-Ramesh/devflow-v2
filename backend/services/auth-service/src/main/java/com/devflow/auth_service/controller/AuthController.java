package com.devflow.auth_service.controller;

import com.devflow.auth_service.dto.AuthRequest;
import com.devflow.auth_service.dto.AuthResponse;
import com.devflow.auth_service.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.devflow.auth_service.dto.ForgotPasswordRequest;
import com.devflow.auth_service.dto.ResetPasswordRequest;
import com.devflow.auth_service.dto.MessageResponse;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final String AUTH_COOKIE = "AUTH_TOKEN";

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody AuthRequest req, HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");

        AuthResponse.AuthData data = authService.register(req, ip, userAgent);
        return withAuthCookie(HttpStatus.CREATED, data);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest req, HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");

        AuthResponse.AuthData data = authService.login(req, ip, userAgent);
        return withAuthCookie(HttpStatus.OK, data);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        authService.forgotPassword(req.getEmail());
        return ResponseEntity.ok(new MessageResponse("success", "If the email exists, a reset link will be sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        authService.resetPassword(req.getId(), req.getToken(), req.getPassword());
        return ResponseEntity.ok(new MessageResponse("success", "Password reset successful"));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMe(Authentication authentication) {
        String userId = (String) authentication.getPrincipal();
        Map<String, Object> data = new HashMap<>();
        data.put("id", userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/sessions")
    public ResponseEntity<Map<String, Object>> getSessions(Authentication authentication) {
        String userId = (String) authentication.getPrincipal();
        List<String> sessions = authService.getSessions(userId);
        
        Map<String, Object> data = new HashMap<>();
        data.put("sessions", sessions);
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<MessageResponse> revokeSession(@PathVariable String sessionId, Authentication authentication) {
        String userId = (String) authentication.getPrincipal();
        authService.revokeSession(userId, sessionId);
        return ResponseEntity.ok(new MessageResponse("success", "Session revoked successfully"));
    }

    @DeleteMapping("/logout")
    public ResponseEntity<MessageResponse> logout(Authentication authentication) {
        String userId = (String) authentication.getPrincipal();
        String sessionId = (String) authentication.getCredentials();
        authService.revokeSession(userId, sessionId);
        ResponseCookie cookie = ResponseCookie.from(AUTH_COOKIE, "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        return ResponseEntity.ok().header("Set-Cookie", cookie.toString())
                .body(new MessageResponse("success", "Logged out successfully"));
    }

    private ResponseEntity<AuthResponse> withAuthCookie(HttpStatus status, AuthResponse.AuthData data) {
        ResponseCookie cookie = ResponseCookie.from(AUTH_COOKIE, data.getToken())
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(604800)
                .sameSite("Lax")
                .build();
        AuthResponse response = new AuthResponse("success", new AuthResponse.AuthData(data.getUser(), null));
        return ResponseEntity.status(status).header("Set-Cookie", cookie.toString()).body(response);
    }
}
