package com.devflow.user_service.controller;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.devflow.user_service.dto.BookmarkRequest;
import com.devflow.user_service.dto.BookmarkResponse;
import com.devflow.user_service.dto.LeaderboardUserResponse;
import com.devflow.user_service.dto.UpdateProfileRequest;
import com.devflow.user_service.dto.UserProfileWrapper;
import com.devflow.user_service.dto.UserSearchResponse;
import com.devflow.user_service.model.Bookmark;
import com.devflow.user_service.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping({"/api/users", "/api/v1/users"})
@RequiredArgsConstructor
@Tag(name = "User Management", description = "Endpoints for developer profiles, leaderboards, bookmarks, and search")
public class UserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Search & Directory of Users", description = "Returns a paginated list of developers matching search criteria")
    public ResponseEntity<UserSearchResponse> searchUsers(
            @RequestParam(required = false, defaultValue = "") String q,
            @RequestParam(required = false, defaultValue = "1") int page,
            @RequestParam(required = false, defaultValue = "50") int limit
    ) {
        return ResponseEntity.ok(userService.searchUsers(q, page, limit));
    }

    @GetMapping({"/profile", "/me"})
    @Operation(summary = "Get Current User Profile", description = "Returns the authenticated user's profile and stats", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<UserProfileWrapper> getCurrentUserProfile(Authentication authentication) {
        String userId = authentication.getName();
        return ResponseEntity.ok(userService.getUserProfileWrapper(userId));
    }

    @PutMapping(value = "/profile", consumes = {MediaType.APPLICATION_JSON_VALUE, MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_FORM_URLENCODED_VALUE})
    @Operation(summary = "Update User Profile", description = "Updates user metadata, avatar, bio, and social links", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<UserProfileWrapper> updateProfile(
            Authentication authentication,
            @ModelAttribute UpdateProfileRequest formRequest,
            @RequestBody(required = false) UpdateProfileRequest jsonRequest
    ) {
        String userId = authentication.getName();
        UpdateProfileRequest request = jsonRequest != null ? jsonRequest : formRequest;
        return ResponseEntity.ok(userService.updateProfile(userId, request));
    }

    @GetMapping("/leaderboard")
    @Operation(summary = "Community Leaderboard", description = "Returns developers ordered by reputation with calculated badges")
    public ResponseEntity<List<LeaderboardUserResponse>> getLeaderboard(
            @RequestParam(required = false, defaultValue = "1") int page,
            @RequestParam(required = false, defaultValue = "50") int limit
    ) {
        return ResponseEntity.ok(userService.getLeaderboard(page, limit));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get User Profile by ID", description = "Fetches a public developer profile by their UUID")
    public ResponseEntity<UserProfileWrapper> getUserProfileById(@PathVariable String id) {
        return ResponseEntity.ok(userService.getUserProfileWrapper(id));
    }

    @GetMapping("/bookmarks")
    @Operation(summary = "Get User Bookmarks", description = "Returns all bookmarked questions for the authenticated user", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<Map<String, Object>> getUserBookmarks(Authentication authentication) {
        String userId = authentication.getName();
        List<Bookmark> bookmarks = userService.getUserBookmarks(userId);
        return ResponseEntity.ok(Collections.singletonMap("bookmarks", bookmarks));
    }

    @PostMapping("/bookmark")
    @Operation(summary = "Toggle Question Bookmark", description = "Adds or removes a bookmark for a specific question", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<BookmarkResponse> toggleBookmark(
            Authentication authentication,
            @Valid @RequestBody BookmarkRequest request
    ) {
        String userId = authentication.getName();
        return ResponseEntity.ok(userService.toggleBookmark(userId, request.getQuestionId()));
    }
}
