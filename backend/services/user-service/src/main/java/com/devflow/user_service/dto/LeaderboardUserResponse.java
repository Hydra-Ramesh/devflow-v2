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
public class LeaderboardUserResponse {
    private String id;
    private String fullName;
    private String avatarUrl;
    private String designation;
    private String company;
    private Integer reputation;
    private List<BadgeDTO> badges;
}
