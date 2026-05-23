package com.school_project.api.service;

import com.school_project.api.dto.StudySessionDtos.CreateStudySessionRequest;
import com.school_project.api.dto.StudySessionDtos.SessionStatus;
import com.school_project.api.dto.StudySessionDtos.StudySessionResponse;
import com.school_project.api.dto.StudySessionDtos.UpdateStudySessionRequest;
import com.school_project.api.entity.SessionAttendee;
import com.school_project.api.entity.StudentUser;
import com.school_project.api.entity.StudyGroup;
import com.school_project.api.entity.StudySession;
import com.school_project.api.exception.NotFoundException;
import com.school_project.api.repository.SessionAttendeeRepository;
import com.school_project.api.repository.StudySessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StudySessionService {

    private final StudySessionRepository sessionRepository;
    private final SessionAttendeeRepository attendeeRepository;
    private final GroupService groupService;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    public List<StudySessionResponse> listSessions(Long groupId) {
        groupService.findGroup(groupId);
        return sessionRepository.findByGroupIdOrderByStartsAtAsc(groupId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public StudySessionResponse createSession(Long groupId, CreateStudySessionRequest request) {
        StudyGroup group = groupService.findGroup(groupId);
        StudentUser user = currentUserService.getCurrentUser();

        StudySession session = new StudySession();
        session.setGroup(group);
        session.setCreatedBy(user);
        session.setTitle(request.title());
        session.setDescription(request.description());
        session.setStartsAt(request.startsAt());
        session.setEndsAt(request.endsAt());
        String meetingUrl = (request.meetingUrl() != null && !request.meetingUrl().isBlank())
                ? request.meetingUrl()
                : "https://meet.jit.si/studygroup-" + groupId + "-" + UUID.randomUUID().toString().replace("-", "").substring(0, 10);
        session.setMeetingUrl(meetingUrl);
        session.setCapacity(request.capacity());

        StudySession saved = sessionRepository.save(session);
        joinSession(saved, user);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public StudySessionResponse getSession(Long groupId, Long sessionId) {
        return toResponse(findSession(groupId, sessionId));
    }

    @Transactional
    public StudySessionResponse updateSession(Long groupId, Long sessionId, UpdateStudySessionRequest request) {
        StudySession session = findSession(groupId, sessionId);
        session.setTitle(request.title());
        session.setDescription(request.description());
        session.setStartsAt(request.startsAt());
        session.setEndsAt(request.endsAt());
        session.setMeetingUrl(request.meetingUrl());
        session.setCapacity(request.capacity());
        if (request.status() != null) {
            session.setStatus(StudySession.Status.valueOf(request.status().name()));
        }
        return toResponse(sessionRepository.save(session));
    }

    @Transactional
    public void cancelSession(Long groupId, Long sessionId) {
        StudySession session = findSession(groupId, sessionId);
        session.setStatus(StudySession.Status.CANCELLED);
        sessionRepository.save(session);
    }

    @Transactional
    public StudySessionResponse joinSession(Long groupId, Long sessionId) {
        StudySession session = findSession(groupId, sessionId);
        joinSession(session, currentUserService.getCurrentUser());
        return toResponse(session);
    }

    @Transactional
    public void leaveSession(Long groupId, Long sessionId) {
        StudySession session = findSession(groupId, sessionId);
        StudentUser user = currentUserService.getCurrentUser();
        attendeeRepository.findBySessionAndUser(session, user).ifPresent(attendeeRepository::delete);
    }

    private StudySession findSession(Long groupId, Long sessionId) {
        StudySession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new NotFoundException("Study session not found."));
        if (!session.getGroup().getId().equals(groupId)) {
            throw new NotFoundException("Study session not found in this group.");
        }
        return session;
    }

    private void joinSession(StudySession session, StudentUser user) {
        if (attendeeRepository.existsBySessionAndUser(session, user)) {
            return;
        }
        SessionAttendee attendee = new SessionAttendee();
        attendee.setSession(session);
        attendee.setUser(user);
        attendeeRepository.save(attendee);
    }

    private StudySessionResponse toResponse(StudySession session) {
        return new StudySessionResponse(
                session.getId(),
                session.getGroup().getId(),
                session.getTitle(),
                session.getDescription(),
                session.getStartsAt(),
                session.getEndsAt(),
                session.getMeetingUrl(),
                session.getCapacity(),
                attendeeRepository.countBySessionId(session.getId()),
                SessionStatus.valueOf(session.getStatus().name()),
                session.getCreatedBy().getId(),
                session.getCreatedAt()
        );
    }
}
