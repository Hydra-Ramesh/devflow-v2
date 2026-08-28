package com.devflow.user_service.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.devflow.user_service.model.Bookmark;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, String> {

    Optional<Bookmark> findByUserIdAndQuestionId(String userId, String questionId);

    List<Bookmark> findByUserIdOrderByCreatedAtDesc(String userId);

    void deleteByUserIdAndQuestionId(String userId, String questionId);

    long countByUserId(String userId);
}

