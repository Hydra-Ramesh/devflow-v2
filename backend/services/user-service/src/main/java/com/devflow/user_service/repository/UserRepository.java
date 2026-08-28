package com.devflow.user_service.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.devflow.user_service.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u ORDER BY u.reputation DESC")
    Page<User> findLeaderboard(Pageable pageable);

    @Query("SELECT u FROM User u WHERE " +
           "LOWER(COALESCE(u.fullName, '')) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(COALESCE(u.designation, '')) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "ORDER BY u.reputation DESC")
    Page<User> searchUsers(@Param("q") String query, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.isLookingForWork = true ORDER BY u.reputation DESC")
    Page<User> findTalent(Pageable pageable);
}