package com.school_project.api.dto;

import java.time.Instant;

public final class MessageDtos {
    private MessageDtos() {
    }

    public enum MessageType {
        TEXT,
        MATERIAL,
        SYSTEM
    }

    public record SendMessageRequest(
            String content,
            MessageType type,
            Long materialId
    ) {
    }

    public record MessageResponse(
            Long id,
            Long groupId,
            Long senderId,
            String senderName,
            String content,
            MessageType type,
            Long materialId,
            Instant sentAt,
            Instant editedAt
    ) {
    }
}
