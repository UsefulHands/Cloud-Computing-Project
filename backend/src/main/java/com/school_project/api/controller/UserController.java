package com.school_project.api.controller;

import com.school_project.api.entity.StudentUser;
import com.school_project.api.repository.StudentUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class UserController {

    private final StudentUserRepository userRepository;

    @GetMapping
    public List<Map<String, Object>> getUsers() {
        return userRepository.findAll().stream().map(this::toMap).toList();
    }

    private Map<String, Object> toMap(StudentUser user) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("name", user.getFullName());
        response.put("email", user.getEmail());
        response.put("university", user.getUniversity());
        response.put("department", user.getDepartment());
        return response;
    }
}
