package com.devflow.auth_service.model;


import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;


import java.time.LocalDateTime;
import java.util.UUID;


@Entity
@Table(name = "\"UserAuth\"")
public class UserAuth {
    @Id
    @Column(columnDefinition = "TEXT")
    private String id;

    @Column(unique=true, nullable=false, columnDefinition = "TEXT")
    private String email;

    @Column(name = "\"passwordHash\"", columnDefinition = "TEXT")
    private String passwordHash;

    @Column(name = "\"googleId\"", unique = true, columnDefinition = "TEXT")
    private String googleId;

    @Column(name = "\"githubId\"", unique = true, columnDefinition = "TEXT")
    private String githubId;

    @CreationTimestamp
    @Column(name = "\"createdAt\"", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "\"updatedAt\"")
    private LocalDateTime updatedAt;

    public UserAuth() {}

    public UserAuth(String id, String email, String passwordHash, String googleId, String githubId,
                    LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.email = email;
        this.passwordHash = passwordHash;
        this.googleId = googleId;
        this.githubId = githubId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getGoogleId() { return googleId; }
    public void setGoogleId(String googleId) { this.googleId = googleId; }
    public String getGithubId() { return githubId; }
    public void setGithubId(String githubId) { this.githubId = githubId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
    }
}
