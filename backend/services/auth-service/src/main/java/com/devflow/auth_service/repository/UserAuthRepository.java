package com.devflow.auth_service.repository;

import com.devflow.auth_service.model.UserAuth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserAuthRepository extends JpaRepository<UserAuth, String> {
    Optional<UserAuth> findByEmail(String email);
}