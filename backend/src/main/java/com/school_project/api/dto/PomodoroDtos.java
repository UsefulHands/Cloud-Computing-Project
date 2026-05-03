package com.school_project.api.dto;

import java.time.Instant;

public final class PomodoroDtos {
    private PomodoroDtos() {
    }

    public enum PomodoroStatus {
        RUNNING,
        PAUSED,
        COMPLETED,
        CANCELLED
    }

    public record StartPomodoroRequest(
            Integer focusMinutes,
            Integer shortBreakMinutes,
            Integer longBreakMinutes,
            Integer cycleCount,
            Long taskId
    ) {
    }

    public record UpdatePomodoroStatusRequest(
            PomodoroStatus status
    ) {
    }

    public record PomodoroSessionResponse(
            Long id,
            Long groupId,
            Long userId,
            Long taskId,
            Integer focusMinutes,
            Integer shortBreakMinutes,
            Integer longBreakMinutes,
            Integer cycleCount,
            Integer completedCycles,
            PomodoroStatus status,
            Instant startedAt,
            Instant updatedAt
    ) {
    }
}
