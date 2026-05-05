package com.school_project.api.repository;

import com.school_project.api.entity.WorkspaceTask;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkspaceTaskRepository extends JpaRepository<WorkspaceTask, Long> {
    List<WorkspaceTask> findByGroupIdOrderByCreatedAtDesc(Long groupId);

    void deleteByGroupId(Long groupId);
}
