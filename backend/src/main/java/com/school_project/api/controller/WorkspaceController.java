package com.school_project.api.controller;

import com.school_project.api.dto.WorkspaceDtos.CreateTaskRequest;
import com.school_project.api.dto.WorkspaceDtos.NoteResponse;
import com.school_project.api.dto.WorkspaceDtos.TaskResponse;
import com.school_project.api.dto.WorkspaceDtos.UpdateTaskRequest;
import com.school_project.api.dto.WorkspaceDtos.UpsertNoteRequest;
import com.school_project.api.service.WorkspaceService;
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
@RequestMapping("/api/groups/{groupId}/workspace")
@RequiredArgsConstructor
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    @GetMapping("/notes")
    public List<NoteResponse> listNotes(@PathVariable Long groupId) {
        return workspaceService.listNotes(groupId);
    }

    @PostMapping("/notes")
    @ResponseStatus(HttpStatus.CREATED)
    public NoteResponse createNote(@PathVariable Long groupId, @RequestBody UpsertNoteRequest request) {
        return workspaceService.createNote(groupId, request);
    }

    @PutMapping("/notes/{noteId}")
    public NoteResponse updateNote(@PathVariable Long groupId,
                                   @PathVariable Long noteId,
                                   @RequestBody UpsertNoteRequest request) {
        return workspaceService.updateNote(groupId, noteId, request);
    }

    @DeleteMapping("/notes/{noteId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteNote(@PathVariable Long groupId, @PathVariable Long noteId) {
        workspaceService.deleteNote(groupId, noteId);
    }

    @GetMapping("/tasks")
    public List<TaskResponse> listTasks(@PathVariable Long groupId) {
        return workspaceService.listTasks(groupId);
    }

    @PostMapping("/tasks")
    @ResponseStatus(HttpStatus.CREATED)
    public TaskResponse createTask(@PathVariable Long groupId, @RequestBody CreateTaskRequest request) {
        return workspaceService.createTask(groupId, request);
    }

    @PutMapping("/tasks/{taskId}")
    public TaskResponse updateTask(@PathVariable Long groupId,
                                   @PathVariable Long taskId,
                                   @RequestBody UpdateTaskRequest request) {
        return workspaceService.updateTask(groupId, taskId, request);
    }

    @DeleteMapping("/tasks/{taskId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTask(@PathVariable Long groupId, @PathVariable Long taskId) {
        workspaceService.deleteTask(groupId, taskId);
    }
}
