package com.school_project.api.repository;

import com.school_project.api.entity.SessionAttendee;
import com.school_project.api.entity.StudentUser;
import com.school_project.api.entity.StudySession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SessionAttendeeRepository extends JpaRepository<SessionAttendee, Long> {
    int countBySessionId(Long sessionId);

    void deleteBySessionGroupId(Long groupId);

    boolean existsBySessionAndUser(StudySession session, StudentUser user);

    Optional<SessionAttendee> findBySessionAndUser(StudySession session, StudentUser user);
}
