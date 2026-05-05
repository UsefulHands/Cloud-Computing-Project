package com.school_project.api.service;

import com.school_project.api.dto.AuthDtos.AuthResponse;
import com.school_project.api.dto.AuthDtos.LoginRequest;
import com.school_project.api.dto.AuthDtos.RegisterRequest;
import com.school_project.api.entity.StudentUser;
import com.school_project.api.exception.BadRequestException;
import com.school_project.api.repository.StudentUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final StudentUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email is already registered.");
        }

        StudentUser user = new StudentUser();
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setUniversity(request.university());
        user.setDepartment(request.department());

        return toResponse(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        StudentUser user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadRequestException("Invalid email or password."));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadRequestException("Invalid email or password.");
        }

        return toResponse(user);
    }

    private AuthResponse toResponse(StudentUser user) {
        return new AuthResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                "dev-token-user-" + user.getId()
        );
    }
}
