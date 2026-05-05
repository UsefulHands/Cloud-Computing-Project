package com.school_project.api.service;

import com.school_project.api.dto.PomodoroDtos.PomodoroSessionResponse;
import com.school_project.api.dto.PomodoroDtos.PomodoroStatus;
import com.school_project.api.dto.PomodoroDtos.StartPomodoroRequest;
import com.school_project.api.dto.PomodoroDtos.UpdatePomodoroStatusRequest;
import com.school_project.api.entity.PomodoroSession;
import com.school_project.api.entity.StudentUser;
import com.school_project.api.entity.StudyGroup;
import com.school_project.api.entity.WorkspaceTask;
import com.school_project.api.exception.NotFoundException;
import com.school_project.api.repository.PomodoroSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PomodoroService {

    private final PomodoroSessionRepository pomodoroRepository;
    private final GroupService groupService;
    private final WorkspaceService workspaceService;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    public List<PomodoroSessionResponse> listPomodoros(Long groupId) {
        groupService.findGroup(groupId);
        return pomodoroRepository.findByGroupIdOrderByCreatedAtDesc(groupId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public PomodoroSessionResponse startPomodoro(Long groupId, StartPomodoroRequest request) {
        StudyGroup group = groupService.findGroup(groupId);
        StudentUser user = currentUserService.getCurrentUser();
        WorkspaceTask task = request.taskId() == null ? null : workspaceService.findTask(groupId, request.taskId());

        PomodoroSession pomodoro = new PomodoroSession();
        pomodoro.setGroup(group);
        pomodoro.setUser(user);
        pomodoro.setTask(task);
        pomodoro.setFocusMinutes(request.focusMinutes());
        pomodoro.setShortBreakMinutes(request.shortBreakMinutes());
        pomodoro.setLongBreakMinutes(request.longBreakMinutes());
        pomodoro.setCycleCount(request.cycleCount());
        return toResponse(pomodoroRepository.save(pomodoro));
    }

    @Transactional
    public PomodoroSessionResponse updateStatus(Long groupId, Long pomodoroId, UpdatePomodoroStatusRequest request) {
        PomodoroSession pomodoro = pomodoroRepository.findById(pomodoroId)
                .orElseThrow(() -> new NotFoundException("Pomodoro session not found."));
        if (!pomodoro.getGroup().getId().equals(groupId)) {
            throw new NotFoundException("Pomodoro session not found in this group.");
        }
        pomodoro.setStatus(PomodoroSession.Status.valueOf(request.status().name()));
        if (request.status() == PomodoroStatus.COMPLETED) {
            pomodoro.setCompletedCycles(pomodoro.getCycleCount());
        }
        return toResponse(pomodoroRepository.save(pomodoro));
    }

    private PomodoroSessionResponse toResponse(PomodoroSession pomodoro) {
        return new PomodoroSessionResponse(
                pomodoro.getId(),
                pomodoro.getGroup().getId(),
                pomodoro.getUser().getId(),
                pomodoro.getTask() == null ? null : pomodoro.getTask().getId(),
                pomodoro.getFocusMinutes(),
                pomodoro.getShortBreakMinutes(),
                pomodoro.getLongBreakMinutes(),
                pomodoro.getCycleCount(),
                pomodoro.getCompletedCycles(),
                PomodoroStatus.valueOf(pomodoro.getStatus().name()),
                pomodoro.getStartedAt(),
                pomodoro.getUpdatedAt()
        );
    }
}
