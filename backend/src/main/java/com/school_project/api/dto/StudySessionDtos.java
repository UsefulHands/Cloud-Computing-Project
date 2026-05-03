package com.school_project.api.dto;

import java.time.Instant;

public final class StudySessionDtos {
    private StudySessionDtos() {
    }

    public enum SessionStatus {
        SCHEDULED,
        LIVE,
        ENDED,
        CANCELLED
    }

    public record CreateStudySessionRequest(
            String title,
            String description,
            Instant startsAt,
            Instant endsAt,
            String meetingUrl,
            Integer capacity
    ) {
    }

    public record UpdateStudySessionRequest(
            String title,
            String description,
            Instant startsAt,
            Instant endsAt,
            String meetingUrl,
            Integer capacity,
            SessionStatus status
    ) {
    }

    public record StudySessionResponse(
            Long id,
            Long groupId,
            String title,
            String description,
            Instant startsAt,
            Instant endsAt,
            String meetingUrl,
            Integer capacity,
            Integer attendeeCount,
            SessionStatus status,
            Long createdBy,
            Instant createdAt
    ) {
    }
}
