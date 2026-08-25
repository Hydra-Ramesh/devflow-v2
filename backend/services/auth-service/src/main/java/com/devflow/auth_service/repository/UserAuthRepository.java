package com.devflow.auth_service.repository;

import com.devflow.auth_service.model.UserAuth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserAuthRepository extends JpaRepository<UserAuth, String> {
    Optional<UserAuth> findByEmail(String email);

    @Modifying
    @Query("UPDATE UserAuth u SET u.passwordHash = :passwordHash WHERE u.id = :id")
    void updatePassword(@Param("id") String id, @Param("passwordHash") String passwordHash);
}
