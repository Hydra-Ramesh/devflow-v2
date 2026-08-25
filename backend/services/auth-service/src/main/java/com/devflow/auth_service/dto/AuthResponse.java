package com.devflow.auth_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

public class AuthResponse {
    private String status;
    private AuthData data;

    public AuthResponse() {}
    public AuthResponse(String status, AuthData data) { this.status = status; this.data = data; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public AuthData getData() { return data; }
    public void setData(AuthData data) { this.data = data; }

    public static class AuthData {
        private UserDto user;
        @JsonInclude(JsonInclude.Include.NON_NULL)
        private String token;

        public AuthData() {}
        public AuthData(UserDto user, String token) { this.user = user; this.token = token; }
        public UserDto getUser() { return user; }
        public void setUser(UserDto user) { this.user = user; }
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
    }

    public static class UserDto {
        private String id;
        private String email;

        public UserDto() {}
        public UserDto(String id, String email) { this.id = id; this.email = email; }
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }
}
