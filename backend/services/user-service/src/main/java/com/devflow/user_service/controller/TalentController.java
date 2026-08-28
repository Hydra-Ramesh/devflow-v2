package com.devflow.user_service.controller;


import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.devflow.user_service.dto.TalentUserResponse;
import com.devflow.user_service.dto.UpdateTalentRequest;
import com.devflow.user_service.dto.UserProfileWrapper;
import com.devflow.user_service.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping({"/api/talent", "/api/v1/talent"})
@RequiredArgsConstructor
@Tag(name = "Talent Matchmaking", description = "Endpoints for finding developers looking for work and hiring")
public class TalentController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Search Available Talent", description = "Returns developers actively looking for work, sorted by reputation")
    public ResponseEntity<List<TalentUserResponse>> getTalent(
            @RequestParam(required = false, defaultValue = "") String skills,
            @RequestParam(required = false, defaultValue = "1") int page,
            @RequestParam(required = false, defaultValue = "50") int limit
    ) {
        return ResponseEntity.ok(userService.getTalent(skills, page, limit));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update Job Seeking & Talent Profile", description = "Updates job seeker status, resume URL, and experience", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<UserProfileWrapper> updateTalentProfile(
            Authentication authentication,
            @RequestBody UpdateTalentRequest request
    ) {
        String userId = authentication.getName();
        return ResponseEntity.ok(userService.updateTalentStatus(userId, request));
    }
}