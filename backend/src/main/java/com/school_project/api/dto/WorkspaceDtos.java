package com.school_project.api.dto;

import java.time.Instant;

public final class WorkspaceDtos {
    private WorkspaceDtos() {
    }

    public enum TaskStatus {
        TODO,
        IN_PROGRESS,
        DONE
    }

    public record UpsertNoteRequest(
            String title,
            String content
    ) {
    }

    public record NoteResponse(
            Long id,
            Long groupId,
            String title,
            String content,
            Long updatedBy,
            Instant updatedAt
    ) {
    }

    public record CreateTaskRequest(
            String title,
            String description,
            Long assignedTo,
            Instant dueAt
    ) {
    }

    public record UpdateTaskRequest(
            String title,
            String description,
            Long assignedTo,
            Instant dueAt,
            TaskStatus status
    ) {
    }

    public record TaskResponse(
            Long id,
            Long groupId,
            String title,
            String description,
            Long assignedTo,
            Instant dueAt,
            TaskStatus status,
            Instant createdAt,
            Instant updatedAt
    ) {
    }
}
