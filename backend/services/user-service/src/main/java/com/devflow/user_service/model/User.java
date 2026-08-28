package com.devflow.user_service.model;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "\"User\"")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @Column(columnDefinition = "TEXT")
    private String id;

    @Column(unique = true, nullable = false, columnDefinition = "TEXT")
    private String email;

    @Column(name = "\"fullName\"", columnDefinition = "TEXT")
    private String fullName;

    @Column(name = "\"avatarUrl\"", columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(columnDefinition = "TEXT")
    private String designation;

    @Column(columnDefinition = "TEXT")
    private String company;

    @Column(name = "\"linkedinUrl\"", columnDefinition = "TEXT")
    private String linkedinUrl;

    @Column(name = "\"githubUrl\"", columnDefinition = "TEXT")
    private String githubUrl;

    @Column(name = "\"portfolioUrl\"", columnDefinition = "TEXT")
    private String portfolioUrl;

    @Builder.Default
    @Column(nullable = false)
    private Integer reputation = 10;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;

    @Builder.Default
    @Column(name = "\"isLookingForWork\"", nullable = false)
    private Boolean isLookingForWork = false;

    @Column(name = "\"resumeUrl\"", columnDefinition = "TEXT")
    private String resumeUrl;

    @Column(name = "\"preferredRoles\"", columnDefinition = "TEXT[]")
    private String[] preferredRoles;

    @Column(name = "\"yearsOfExperience\"")
    private Integer yearsOfExperience;

    @CreationTimestamp
    @Column(name = "\"createdAt\"", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "\"updatedAt\"")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
        if (this.reputation == null) {
            this.reputation = 10;
        }
        if (this.role == null) {
            this.role = Role.USER;
        }
        if (this.isLookingForWork == null) {
            this.isLookingForWork = false;
        }
    }
}

