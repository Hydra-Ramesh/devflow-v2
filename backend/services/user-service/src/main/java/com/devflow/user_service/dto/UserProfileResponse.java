package com.devflow.user_service.dto;

import com.devflow.user_service.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private String id;
    private String email;
    private String fullName;
    private String avatarUrl;
    private String designation;
    private String company;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;
    private Integer reputation;
    private Role role;
    private Boolean isLookingForWork;
    private String resumeUrl;
    private List<String> preferredRoles;
    private Integer yearsOfExperience;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private List<BadgeDTO> badges;
    private Map<String, Object> stats;
}
