package com.school_project.api.controller;

import com.school_project.api.dto.StudySessionDtos.CreateStudySessionRequest;
import com.school_project.api.dto.StudySessionDtos.StudySessionResponse;
import com.school_project.api.dto.StudySessionDtos.UpdateStudySessionRequest;
import com.school_project.api.service.StudySessionService;
import lombok.RequiredArgsConstructor;
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

import java.util.List;

@RestController
@RequestMapping("/api/groups/{groupId}/sessions")
@RequiredArgsConstructor
public class StudySessionController {

    private final StudySessionService studySessionService;

    @GetMapping
    public List<StudySessionResponse> listSessions(@PathVariable Long groupId) {
        return studySessionService.listSessions(groupId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StudySessionResponse createSession(@PathVariable Long groupId,
                                              @RequestBody CreateStudySessionRequest request) {
        return studySessionService.createSession(groupId, request);
    }

    @GetMapping("/{sessionId}")
    public StudySessionResponse getSession(@PathVariable Long groupId, @PathVariable Long sessionId) {
        return studySessionService.getSession(groupId, sessionId);
    }

    @PutMapping("/{sessionId}")
    public StudySessionResponse updateSession(@PathVariable Long groupId,
                                              @PathVariable Long sessionId,
                                              @RequestBody UpdateStudySessionRequest request) {
        return studySessionService.updateSession(groupId, sessionId, request);
    }

    @DeleteMapping("/{sessionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancelSession(@PathVariable Long groupId, @PathVariable Long sessionId) {
        studySessionService.cancelSession(groupId, sessionId);
    }

    @PostMapping("/{sessionId}/attendees")
    @ResponseStatus(HttpStatus.CREATED)
    public StudySessionResponse joinSession(@PathVariable Long groupId, @PathVariable Long sessionId) {
        return studySessionService.joinSession(groupId, sessionId);
    }

    @DeleteMapping("/{sessionId}/attendees/me")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void leaveSession(@PathVariable Long groupId, @PathVariable Long sessionId) {
        studySessionService.leaveSession(groupId, sessionId);
    }
}
