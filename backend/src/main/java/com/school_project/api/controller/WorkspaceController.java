package com.school_project.api.controller;

import com.school_project.api.dto.WorkspaceDtos.CreateTaskRequest;
import com.school_project.api.dto.WorkspaceDtos.NoteResponse;
import com.school_project.api.dto.WorkspaceDtos.TaskResponse;
import com.school_project.api.dto.WorkspaceDtos.TaskStatus;
import com.school_project.api.dto.WorkspaceDtos.UpdateTaskRequest;
import com.school_project.api.dto.WorkspaceDtos.UpsertNoteRequest;
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
@RequestMapping("/api/groups/{groupId}/workspace")
public class WorkspaceController {

    @GetMapping("/notes")
    public List<NoteResponse> listNotes(@PathVariable Long groupId) {
        return List.of(new NoteResponse(1L, groupId, "Exam topics", "Virtualization, containers, scaling.", 1L, Instant.now()));
    }

    @PostMapping("/notes")
    @ResponseStatus(HttpStatus.CREATED)
    public NoteResponse createNote(@PathVariable Long groupId, @RequestBody UpsertNoteRequest request) {
        return new NoteResponse(1L, groupId, request.title(), request.content(), 1L, Instant.now());
    }

    @PutMapping("/notes/{noteId}")
    public NoteResponse updateNote(@PathVariable Long groupId,
                                   @PathVariable Long noteId,
                                   @RequestBody UpsertNoteRequest request) {
        return new NoteResponse(noteId, groupId, request.title(), request.content(), 1L, Instant.now());
    }

    @DeleteMapping("/notes/{noteId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteNote(@PathVariable Long groupId, @PathVariable Long noteId) {
    }

    @GetMapping("/tasks")
    public List<TaskResponse> listTasks(@PathVariable Long groupId) {
        return List.of(sampleTask(groupId, 1L));
    }

    @PostMapping("/tasks")
    @ResponseStatus(HttpStatus.CREATED)
    public TaskResponse createTask(@PathVariable Long groupId, @RequestBody CreateTaskRequest request) {
        Instant now = Instant.now();
        return new TaskResponse(1L, groupId, request.title(), request.description(), request.assignedTo(), request.dueAt(), TaskStatus.TODO, now, now);
    }

    @PutMapping("/tasks/{taskId}")
    public TaskResponse updateTask(@PathVariable Long groupId,
                                   @PathVariable Long taskId,
                                   @RequestBody UpdateTaskRequest request) {
        return new TaskResponse(
                taskId,
                groupId,
                request.title(),
                request.description(),
                request.assignedTo(),
                request.dueAt(),
                request.status(),
                Instant.now(),
                Instant.now()
        );
    }

    @DeleteMapping("/tasks/{taskId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTask(@PathVariable Long groupId, @PathVariable Long taskId) {
    }

    private TaskResponse sampleTask(Long groupId, Long taskId) {
        Instant now = Instant.now();
        return new TaskResponse(taskId, groupId, "Read MapReduce paper", "Summarize key points before session.", 2L, now.plusSeconds(86400), TaskStatus.IN_PROGRESS, now, now);
    }
}
