package com.school_project.api.service;

import com.school_project.api.entity.StudentUser;
import com.school_project.api.repository.StudentUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private static final String DEV_USER_EMAIL = "dev.student@mail.com";

    private final StudentUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public StudentUser getCurrentUser() {
        return userRepository.findByEmail(DEV_USER_EMAIL).orElseGet(this::createDevUser);
    }

    private StudentUser createDevUser() {
        StudentUser user = new StudentUser();
        user.setFullName("Dev Student");
        user.setEmail(DEV_USER_EMAIL);
        user.setPasswordHash(passwordEncoder.encode("password"));
        user.setUniversity("Demo University");
        user.setDepartment("Computer Engineering");
        return userRepository.save(user);
    }
}
