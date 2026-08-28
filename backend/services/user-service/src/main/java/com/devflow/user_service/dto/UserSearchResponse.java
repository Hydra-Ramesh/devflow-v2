package com.devflow.user_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSearchResponse {
    private List<LeaderboardUserResponse> users;
    private Long total;
    private Integer page;
    private Integer totalPages;
}
