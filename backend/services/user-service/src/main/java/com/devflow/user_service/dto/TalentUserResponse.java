package com.devflow.user_service.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TalentUserResponse {
    private String id;
    private String fullName;
    private String avatarUrl;
    private String designation;
    private String company;
    private Integer reputation;
    private Boolean isLookingForWork;
    private String resumeUrl;
    private Integer yearsOfExperience;
    
    @Builder.Default
    private List<String> preferredRoles = new ArrayList<>();
    
    private String githubUrl;
    private String linkedinUrl;
    private String portfolioUrl;
    
    @Builder.Default
    private List<BadgeDTO> badges = new ArrayList<>();
}

