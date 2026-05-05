package com.school_project.api.repository;

import com.school_project.api.entity.GroupMember;
import com.school_project.api.entity.StudyGroup;
import com.school_project.api.entity.StudentUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    List<GroupMember> findByGroupId(Long groupId);

    int countByGroupId(Long groupId);

    void deleteByGroupId(Long groupId);

    boolean existsByGroupAndUser(StudyGroup group, StudentUser user);

    Optional<GroupMember> findByGroupAndUser(StudyGroup group, StudentUser user);
}
