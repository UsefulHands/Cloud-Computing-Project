package com.school_project.api.repository;

import com.school_project.api.entity.WorkspaceNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkspaceNoteRepository extends JpaRepository<WorkspaceNote, Long> {
    List<WorkspaceNote> findByGroupIdOrderByUpdatedAtDesc(Long groupId);

    void deleteByGroupId(Long groupId);
}
