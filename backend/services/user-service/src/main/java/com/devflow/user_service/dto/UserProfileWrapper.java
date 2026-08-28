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
public class UserProfileWrapper {
    private UserProfileResponse profile;
    
    @Builder.Default
    private List<Object> recentQuestions = new ArrayList<>();
    
    @Builder.Default
    private List<Object> allQuestions = new ArrayList<>();
}
