package com.devflow.auth_service.model;


import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;


import java.time.LocalDateTime;
import java.util.UUID;


@Entity
@Table(name = "\"UserAuth\"")
@Data
@NoArgsConstructor
@AllArgsConstructor
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

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
    }
}
