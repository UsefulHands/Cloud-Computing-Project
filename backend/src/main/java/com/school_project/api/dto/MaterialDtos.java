package com.school_project.api.dto;

import java.time.Instant;

public final class MaterialDtos {
    private MaterialDtos() {
    }

    public enum MaterialType {
        PDF,
        IMAGE,
        LINK,
        DOCUMENT,
        OTHER
    }

    public record CreateMaterialRequest(
            String title,
            String description,
            MaterialType type,
            String url
    ) {
    }

    public record MaterialResponse(
            Long id,
            Long groupId,
            String title,
            String description,
            MaterialType type,
            String url,
            Long uploadedBy,
            Instant uploadedAt
    ) {
    }
}
