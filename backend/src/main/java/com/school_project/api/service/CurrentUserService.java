package com.school_project.api.service;

import com.school_project.api.entity.StudentUser;
import com.school_project.api.repository.StudentUserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private static final String DEV_USER_EMAIL = "dev.student@mail.com";
    private static final String TOKEN_PREFIX = "Bearer dev-token-user-";

    private final StudentUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public StudentUser getCurrentUser() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest request = attrs.getRequest();
                String auth = request.getHeader("Authorization");
                if (auth != null && auth.startsWith(TOKEN_PREFIX)) {
                    long userId = Long.parseLong(auth.substring(TOKEN_PREFIX.length()).trim());
                    return userRepository.findById(userId)
                            .orElseGet(this::getOrCreateDevUser);
                }
            }
        } catch (Exception ignored) {}
        return getOrCreateDevUser();
    }

    private StudentUser getOrCreateDevUser() {
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
