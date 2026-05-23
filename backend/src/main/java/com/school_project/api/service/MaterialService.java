package com.school_project.api.service;

import com.school_project.api.dto.MaterialDtos.CreateMaterialRequest;
import com.school_project.api.dto.MaterialDtos.MaterialResponse;
import com.school_project.api.dto.MaterialDtos.MaterialType;
import com.school_project.api.entity.StudentUser;
import com.school_project.api.entity.StudyGroup;
import com.school_project.api.entity.StudyMaterial;
import com.school_project.api.exception.NotFoundException;
import com.school_project.api.repository.ChatMessageRepository;
import com.school_project.api.repository.StudyMaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MaterialService {

    private final StudyMaterialRepository materialRepository;
    private final ChatMessageRepository messageRepository;
    private final GroupService groupService;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    public List<MaterialResponse> listMaterials(Long groupId) {
        groupService.requireApprovedMember(groupId);
        return materialRepository.findByGroupIdOrderByCreatedAtDesc(groupId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public MaterialResponse createMaterial(Long groupId, CreateMaterialRequest request) {
        groupService.requireApprovedMember(groupId);
        StudyGroup group = groupService.findGroup(groupId);
        StudentUser user = currentUserService.getCurrentUser();

        StudyMaterial material = new StudyMaterial();
        material.setGroup(group);
        material.setTitle(request.title());
        material.setDescription(request.description());
        material.setType(toEntityType(request.type()));
        material.setUrl(request.url());
        material.setUploadedBy(user);
        return toResponse(materialRepository.save(material));
    }

    @Transactional
    public void deleteMaterial(Long groupId, Long materialId) {
        StudyMaterial material = findMaterial(groupId, materialId);
        messageRepository.deleteByMaterialId(materialId);
        materialRepository.delete(material);
    }

    public StudyMaterial findMaterial(Long groupId, Long materialId) {
        StudyMaterial material = materialRepository.findById(materialId)
                .orElseThrow(() -> new NotFoundException("Material not found."));
        if (!material.getGroup().getId().equals(groupId)) {
            throw new NotFoundException("Material not found in this group.");
        }
        return material;
    }

    private MaterialResponse toResponse(StudyMaterial material) {
        return new MaterialResponse(
                material.getId(),
                material.getGroup().getId(),
                material.getTitle(),
                material.getDescription(),
                MaterialType.valueOf(material.getType().name()),
                material.getUrl(),
                material.getUploadedBy().getId(),
                material.getCreatedAt()
        );
    }

    private StudyMaterial.MaterialType toEntityType(MaterialType type) {
        if (type == null) {
            return StudyMaterial.MaterialType.OTHER;
        }
        return StudyMaterial.MaterialType.valueOf(type.name());
    }
}
