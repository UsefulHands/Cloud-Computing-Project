package com.school_project.api.controller;

import com.school_project.api.dto.MaterialDtos.CreateMaterialRequest;
import com.school_project.api.dto.MaterialDtos.MaterialResponse;
import com.school_project.api.service.MaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/groups/{groupId}/materials")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialService materialService;

    @GetMapping
    public List<MaterialResponse> listMaterials(@PathVariable Long groupId) {
        return materialService.listMaterials(groupId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MaterialResponse createMaterial(@PathVariable Long groupId, @RequestBody CreateMaterialRequest request) {
        return materialService.createMaterial(groupId, request);
    }

    @DeleteMapping("/{materialId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMaterial(@PathVariable Long groupId, @PathVariable Long materialId) {
        materialService.deleteMaterial(groupId, materialId);
    }
}
