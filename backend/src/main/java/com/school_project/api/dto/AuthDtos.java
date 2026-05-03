package com.school_project.api.dto;

public final class AuthDtos {
    private AuthDtos() {
    }

    public record RegisterRequest(
            String fullName,
            String email,
            String password,
            String university,
            String department
    ) {
    }

    public record LoginRequest(
            String email,
            String password
    ) {
    }

    public record AuthResponse(
            Long userId,
            String fullName,
            String email,
            String accessToken
    ) {
    }
}
