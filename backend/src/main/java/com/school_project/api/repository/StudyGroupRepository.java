package com.school_project.api.repository;

import com.school_project.api.entity.StudyGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudyGroupRepository extends JpaRepository<StudyGroup, Long> {
    List<StudyGroup> findBySubjectContainingIgnoreCase(String subject);

    List<StudyGroup> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String name, String description);
}
