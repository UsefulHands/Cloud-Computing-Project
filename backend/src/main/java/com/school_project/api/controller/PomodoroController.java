package com.school_project.api.controller;

import com.school_project.api.dto.PomodoroDtos.PomodoroSessionResponse;
import com.school_project.api.dto.PomodoroDtos.StartPomodoroRequest;
import com.school_project.api.dto.PomodoroDtos.UpdatePomodoroStatusRequest;
import com.school_project.api.service.PomodoroService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/groups/{groupId}/pomodoros")
@RequiredArgsConstructor
public class PomodoroController {

    private final PomodoroService pomodoroService;

    @GetMapping
    public List<PomodoroSessionResponse> listPomodoros(@PathVariable Long groupId) {
        return pomodoroService.listPomodoros(groupId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PomodoroSessionResponse startPomodoro(@PathVariable Long groupId, @RequestBody StartPomodoroRequest request) {
        return pomodoroService.startPomodoro(groupId, request);
    }

    @PatchMapping("/{pomodoroId}/status")
    public PomodoroSessionResponse updateStatus(@PathVariable Long groupId,
                                                @PathVariable Long pomodoroId,
                                                @RequestBody UpdatePomodoroStatusRequest request) {
        return pomodoroService.updateStatus(groupId, pomodoroId, request);
    }
}
