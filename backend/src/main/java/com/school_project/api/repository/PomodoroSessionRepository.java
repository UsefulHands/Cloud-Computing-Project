package com.school_project.api.repository;

import com.school_project.api.entity.PomodoroSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PomodoroSessionRepository extends JpaRepository<PomodoroSession, Long> {
    List<PomodoroSession> findByGroupIdOrderByCreatedAtDesc(Long groupId);

    void deleteByGroupId(Long groupId);

    void deleteByTaskId(Long taskId);
}
