package com.devflow.user_service.model;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "\"Bookmark\"", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"\"userId\"", "\"questionId\""})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Bookmark {

    @Id
    @Column(columnDefinition = "TEXT")
    private String id;

    @Column(name = "\"userId\"", nullable = false, columnDefinition = "TEXT")
    private String userId;

    @Column(name = "\"questionId\"", nullable = false, columnDefinition = "TEXT")
    private String questionId;

    @CreationTimestamp
    @Column(name = "\"createdAt\"", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
    }
}

