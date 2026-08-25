package com.devflow.auth_service.dto;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String status;
    private AuthData data;

    @Data
    @AllArgsConstructor
    public static class AuthData {
        private UserDto user;
        private String token;
    }

    @Data
    @AllArgsConstructor
    public static class UserDto {
        private String id;
        private String email;
    }
}
