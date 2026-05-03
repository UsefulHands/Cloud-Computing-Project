package com.school_project.api.controller;

import com.school_project.api.dto.PomodoroDtos.PomodoroSessionResponse;
import com.school_project.api.dto.PomodoroDtos.PomodoroStatus;
import com.school_project.api.dto.PomodoroDtos.StartPomodoroRequest;
import com.school_project.api.dto.PomodoroDtos.UpdatePomodoroStatusRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/groups/{groupId}/pomodoros")
public class PomodoroController {

    @GetMapping
    public List<PomodoroSessionResponse> listPomodoros(@PathVariable Long groupId) {
        return List.of(samplePomodoro(groupId, 1L, PomodoroStatus.RUNNING));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PomodoroSessionResponse startPomodoro(@PathVariable Long groupId, @RequestBody StartPomodoroRequest request) {
        Instant now = Instant.now();
        return new PomodoroSessionResponse(
                1L,
                groupId,
                1L,
                request.taskId(),
                request.focusMinutes(),
                request.shortBreakMinutes(),
                request.longBreakMinutes(),
                request.cycleCount(),
                0,
                PomodoroStatus.RUNNING,
                now,
                now
        );
    }

    @PatchMapping("/{pomodoroId}/status")
    public PomodoroSessionResponse updateStatus(@PathVariable Long groupId,
                                                @PathVariable Long pomodoroId,
                                                @RequestBody UpdatePomodoroStatusRequest request) {
        return samplePomodoro(groupId, pomodoroId, request.status());
    }

    private PomodoroSessionResponse samplePomodoro(Long groupId, Long pomodoroId, PomodoroStatus status) {
        Instant now = Instant.now();
        return new PomodoroSessionResponse(pomodoroId, groupId, 1L, 1L, 25, 5, 15, 4, 1, status, now.minusSeconds(1500), now);
    }
}
