package com.school_project.api.repository;

import com.school_project.api.entity.StudentUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudentUserRepository extends JpaRepository<StudentUser, Long> {
    Optional<StudentUser> findByEmail(String email);

    boolean existsByEmail(String email);
}
