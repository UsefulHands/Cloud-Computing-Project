package com.school_project.api.controller;

import com.school_project.api.dto.MaterialDtos.CreateMaterialRequest;
import com.school_project.api.dto.MaterialDtos.MaterialResponse;
import com.school_project.api.dto.MaterialDtos.MaterialType;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/groups/{groupId}/materials")
public class MaterialController {

    @GetMapping
    public List<MaterialResponse> listMaterials(@PathVariable Long groupId) {
        return List.of(new MaterialResponse(
                1L,
                groupId,
                "Cloud notes",
                "Shared lecture notes.",
                MaterialType.PDF,
                "https://files.example.com/cloud-notes.pdf",
                1L,
                Instant.now()
        ));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MaterialResponse createMaterial(@PathVariable Long groupId, @RequestBody CreateMaterialRequest request) {
        return new MaterialResponse(2L, groupId, request.title(), request.description(), request.type(), request.url(), 1L, Instant.now());
    }

    @DeleteMapping("/{materialId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMaterial(@PathVariable Long groupId, @PathVariable Long materialId) {
    }
}
