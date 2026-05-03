package com.school_project.api.controller;

import com.school_project.api.dto.AuthDtos.AuthResponse;
import com.school_project.api.dto.AuthDtos.LoginRequest;
import com.school_project.api.dto.AuthDtos.RegisterRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@RequestBody RegisterRequest request) {
        return new AuthResponse(1L, request.fullName(), request.email(), "sample-access-token");
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        return new AuthResponse(1L, "Sample Student", request.email(), "sample-access-token");
    }
}
