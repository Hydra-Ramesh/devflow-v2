package com.devflow.user_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    private String fullName;
    private String designation;
    private String company;
    private String avatarUrl;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;
}
