package com.school_project.api.service;

import com.school_project.api.dto.WorkspaceDtos.CreateTaskRequest;
import com.school_project.api.dto.WorkspaceDtos.NoteResponse;
import com.school_project.api.dto.WorkspaceDtos.TaskResponse;
import com.school_project.api.dto.WorkspaceDtos.TaskStatus;
import com.school_project.api.dto.WorkspaceDtos.UpdateTaskRequest;
import com.school_project.api.dto.WorkspaceDtos.UpsertNoteRequest;
import com.school_project.api.entity.StudentUser;
import com.school_project.api.entity.StudyGroup;
import com.school_project.api.entity.WorkspaceNote;
import com.school_project.api.entity.WorkspaceTask;
import com.school_project.api.exception.NotFoundException;
import com.school_project.api.repository.StudentUserRepository;
import com.school_project.api.repository.WorkspaceNoteRepository;
import com.school_project.api.repository.WorkspaceTaskRepository;
import com.school_project.api.repository.PomodoroSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkspaceService {

    private final WorkspaceNoteRepository noteRepository;
    private final WorkspaceTaskRepository taskRepository;
    private final PomodoroSessionRepository pomodoroRepository;
    private final StudentUserRepository userRepository;
    private final GroupService groupService;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    public List<NoteResponse> listNotes(Long groupId) {
        groupService.findGroup(groupId);
        return noteRepository.findByGroupIdOrderByUpdatedAtDesc(groupId).stream().map(this::toNoteResponse).toList();
    }

    @Transactional
    public NoteResponse createNote(Long groupId, UpsertNoteRequest request) {
        StudyGroup group = groupService.findGroup(groupId);
        StudentUser user = currentUserService.getCurrentUser();

        WorkspaceNote note = new WorkspaceNote();
        note.setGroup(group);
        note.setTitle(request.title());
        note.setContent(request.content());
        note.setUpdatedBy(user);
        return toNoteResponse(noteRepository.save(note));
    }

    @Transactional
    public NoteResponse updateNote(Long groupId, Long noteId, UpsertNoteRequest request) {
        WorkspaceNote note = findNote(groupId, noteId);
        note.setTitle(request.title());
        note.setContent(request.content());
        note.setUpdatedBy(currentUserService.getCurrentUser());
        return toNoteResponse(noteRepository.save(note));
    }

    @Transactional
    public void deleteNote(Long groupId, Long noteId) {
        noteRepository.delete(findNote(groupId, noteId));
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> listTasks(Long groupId) {
        groupService.findGroup(groupId);
        return taskRepository.findByGroupIdOrderByCreatedAtDesc(groupId).stream().map(this::toTaskResponse).toList();
    }

    @Transactional
    public TaskResponse createTask(Long groupId, CreateTaskRequest request) {
        StudyGroup group = groupService.findGroup(groupId);
        WorkspaceTask task = new WorkspaceTask();
        task.setGroup(group);
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setAssignedTo(findUserOrNull(request.assignedTo()));
        task.setDueAt(request.dueAt());
        task.setStatus(WorkspaceTask.Status.TODO);
        return toTaskResponse(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse updateTask(Long groupId, Long taskId, UpdateTaskRequest request) {
        WorkspaceTask task = findTask(groupId, taskId);
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setAssignedTo(findUserOrNull(request.assignedTo()));
        task.setDueAt(request.dueAt());
        if (request.status() != null) {
            task.setStatus(WorkspaceTask.Status.valueOf(request.status().name()));
        }
        return toTaskResponse(taskRepository.save(task));
    }

    @Transactional
    public void deleteTask(Long groupId, Long taskId) {
        pomodoroRepository.deleteByTaskId(taskId);
        taskRepository.delete(findTask(groupId, taskId));
    }

    public WorkspaceTask findTask(Long groupId, Long taskId) {
        WorkspaceTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new NotFoundException("Task not found."));
        if (!task.getGroup().getId().equals(groupId)) {
            throw new NotFoundException("Task not found in this group.");
        }
        return task;
    }

    private WorkspaceNote findNote(Long groupId, Long noteId) {
        WorkspaceNote note = noteRepository.findById(noteId)
                .orElseThrow(() -> new NotFoundException("Note not found."));
        if (!note.getGroup().getId().equals(groupId)) {
            throw new NotFoundException("Note not found in this group.");
        }
        return note;
    }

    private StudentUser findUserOrNull(Long userId) {
        if (userId == null) {
            return null;
        }
        return userRepository.findById(userId).orElseThrow(() -> new NotFoundException("Assigned user not found."));
    }

    private NoteResponse toNoteResponse(WorkspaceNote note) {
        return new NoteResponse(
                note.getId(),
                note.getGroup().getId(),
                note.getTitle(),
                note.getContent(),
                note.getUpdatedBy().getId(),
                note.getUpdatedAt()
        );
    }

    private TaskResponse toTaskResponse(WorkspaceTask task) {
        return new TaskResponse(
                task.getId(),
                task.getGroup().getId(),
                task.getTitle(),
                task.getDescription(),
                task.getAssignedTo() == null ? null : task.getAssignedTo().getId(),
                task.getDueAt(),
                TaskStatus.valueOf(task.getStatus().name()),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}
