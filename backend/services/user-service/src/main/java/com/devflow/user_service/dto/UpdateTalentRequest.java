package com.devflow.user_service.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTalentRequest {
    private Boolean isLookingForWork;
    private String resumeUrl;
    private Integer yearsOfExperience;
    private List<String> preferredRoles;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;
}
