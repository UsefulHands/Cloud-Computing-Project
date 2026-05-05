package com.school_project.api.repository;

import com.school_project.api.entity.StudyMaterial;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudyMaterialRepository extends JpaRepository<StudyMaterial, Long> {
    List<StudyMaterial> findByGroupIdOrderByCreatedAtDesc(Long groupId);

    void deleteByGroupId(Long groupId);
}
