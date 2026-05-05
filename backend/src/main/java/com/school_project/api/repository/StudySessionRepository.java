package com.school_project.api.repository;

import com.school_project.api.entity.StudySession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudySessionRepository extends JpaRepository<StudySession, Long> {
    List<StudySession> findByGroupIdOrderByStartsAtAsc(Long groupId);

    void deleteByGroupId(Long groupId);
}
