package com.school_project.api.controller;

import com.school_project.api.dto.StudySessionDtos.CreateStudySessionRequest;
import com.school_project.api.dto.StudySessionDtos.SessionStatus;
import com.school_project.api.dto.StudySessionDtos.StudySessionResponse;
import com.school_project.api.dto.StudySessionDtos.UpdateStudySessionRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/groups/{groupId}/sessions")
public class StudySessionController {

    @GetMapping
    public List<StudySessionResponse> listSessions(@PathVariable Long groupId) {
        return List.of(sampleSession(groupId, 1L));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StudySessionResponse createSession(@PathVariable Long groupId,
                                              @RequestBody CreateStudySessionRequest request) {
        return new StudySessionResponse(
                1L,
                groupId,
                request.title(),
                request.description(),
                request.startsAt(),
                request.endsAt(),
                request.meetingUrl(),
                request.capacity(),
                1,
                SessionStatus.SCHEDULED,
                1L,
                Instant.now()
        );
    }

    @GetMapping("/{sessionId}")
    public StudySessionResponse getSession(@PathVariable Long groupId, @PathVariable Long sessionId) {
        return sampleSession(groupId, sessionId);
    }

    @PutMapping("/{sessionId}")
    public StudySessionResponse updateSession(@PathVariable Long groupId,
                                              @PathVariable Long sessionId,
                                              @RequestBody UpdateStudySessionRequest request) {
        return new StudySessionResponse(
                sessionId,
                groupId,
                request.title(),
                request.description(),
                request.startsAt(),
                request.endsAt(),
                request.meetingUrl(),
                request.capacity(),
                4,
                request.status(),
                1L,
                Instant.now()
        );
    }

    @DeleteMapping("/{sessionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancelSession(@PathVariable Long groupId, @PathVariable Long sessionId) {
    }

    @PostMapping("/{sessionId}/attendees")
    @ResponseStatus(HttpStatus.CREATED)
    public StudySessionResponse joinSession(@PathVariable Long groupId, @PathVariable Long sessionId) {
        return sampleSession(groupId, sessionId);
    }

    @DeleteMapping("/{sessionId}/attendees/me")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void leaveSession(@PathVariable Long groupId, @PathVariable Long sessionId) {
    }

    private StudySessionResponse sampleSession(Long groupId, Long sessionId) {
        Instant startsAt = Instant.now().plusSeconds(3600);
        return new StudySessionResponse(
                sessionId,
                groupId,
                "Weekly focus session",
                "Pomodoro-supported online study session.",
                startsAt,
                startsAt.plusSeconds(5400),
                "https://meet.example.com/group-" + groupId,
                10,
                4,
                SessionStatus.SCHEDULED,
                1L,
                Instant.now()
        );
    }
}
