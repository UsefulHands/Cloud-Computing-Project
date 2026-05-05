package com.school_project.api.service;

import com.school_project.api.dto.GroupDtos.CreateGroupRequest;
import com.school_project.api.dto.GroupDtos.GroupMemberResponse;
import com.school_project.api.dto.GroupDtos.GroupResponse;
import com.school_project.api.dto.GroupDtos.GroupVisibility;
import com.school_project.api.dto.GroupDtos.MemberRole;
import com.school_project.api.dto.GroupDtos.UpdateGroupRequest;
import com.school_project.api.entity.GroupMember;
import com.school_project.api.entity.StudentUser;
import com.school_project.api.entity.StudyGroup;
import com.school_project.api.exception.NotFoundException;
import com.school_project.api.repository.ChatMessageRepository;
import com.school_project.api.repository.GroupMemberRepository;
import com.school_project.api.repository.PomodoroSessionRepository;
import com.school_project.api.repository.SessionAttendeeRepository;
import com.school_project.api.repository.StudyMaterialRepository;
import com.school_project.api.repository.StudyGroupRepository;
import com.school_project.api.repository.StudySessionRepository;
import com.school_project.api.repository.WorkspaceNoteRepository;
import com.school_project.api.repository.WorkspaceTaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final StudyGroupRepository groupRepository;
    private final GroupMemberRepository memberRepository;
    private final StudySessionRepository sessionRepository;
    private final SessionAttendeeRepository attendeeRepository;
    private final ChatMessageRepository messageRepository;
    private final WorkspaceNoteRepository noteRepository;
    private final WorkspaceTaskRepository taskRepository;
    private final StudyMaterialRepository materialRepository;
    private final PomodoroSessionRepository pomodoroRepository;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    public List<GroupResponse> listGroups(String subject, String search) {
        List<StudyGroup> groups;
        if (subject != null && !subject.isBlank()) {
            groups = groupRepository.findBySubjectContainingIgnoreCase(subject);
        } else if (search != null && !search.isBlank()) {
            groups = groupRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(search, search);
        } else {
            groups = groupRepository.findAll();
        }
        return groups.stream().map(this::toGroupResponse).toList();
    }

    @Transactional
    public GroupResponse createGroup(CreateGroupRequest request) {
        StudentUser owner = currentUserService.getCurrentUser();

        StudyGroup group = new StudyGroup();
        applyCreateOrUpdate(group, request.name(), request.description(), request.courseCode(), request.subject(),
                request.visibility(), request.maxMembers(), request.tags());
        group.setOwner(owner);
        StudyGroup savedGroup = groupRepository.save(group);

        GroupMember ownerMember = new GroupMember();
        ownerMember.setGroup(savedGroup);
        ownerMember.setUser(owner);
        ownerMember.setRole(GroupMember.Role.OWNER);
        memberRepository.save(ownerMember);

        return toGroupResponse(savedGroup);
    }

    @Transactional(readOnly = true)
    public GroupResponse getGroup(Long groupId) {
        return toGroupResponse(findGroup(groupId));
    }

    @Transactional
    public GroupResponse updateGroup(Long groupId, UpdateGroupRequest request) {
        StudyGroup group = findGroup(groupId);
        applyCreateOrUpdate(group, request.name(), request.description(), request.courseCode(), request.subject(),
                request.visibility(), request.maxMembers(), request.tags());
        return toGroupResponse(groupRepository.save(group));
    }

    @Transactional
    public void deleteGroup(Long groupId) {
        StudyGroup group = findGroup(groupId);
        pomodoroRepository.deleteByGroupId(groupId);
        messageRepository.deleteByGroupId(groupId);
        attendeeRepository.deleteBySessionGroupId(groupId);
        sessionRepository.deleteByGroupId(groupId);
        noteRepository.deleteByGroupId(groupId);
        taskRepository.deleteByGroupId(groupId);
        materialRepository.deleteByGroupId(groupId);
        memberRepository.deleteByGroupId(groupId);
        groupRepository.delete(group);
    }

    @Transactional
    public GroupMemberResponse joinGroup(Long groupId) {
        StudyGroup group = findGroup(groupId);
        StudentUser user = currentUserService.getCurrentUser();

        GroupMember member = memberRepository.findByGroupAndUser(group, user).orElseGet(() -> {
            GroupMember newMember = new GroupMember();
            newMember.setGroup(group);
            newMember.setUser(user);
            newMember.setRole(GroupMember.Role.MEMBER);
            return memberRepository.save(newMember);
        });

        return toMemberResponse(member);
    }

    @Transactional
    public void leaveGroup(Long groupId) {
        StudyGroup group = findGroup(groupId);
        StudentUser user = currentUserService.getCurrentUser();
        memberRepository.findByGroupAndUser(group, user).ifPresent(memberRepository::delete);
    }

    @Transactional(readOnly = true)
    public List<GroupMemberResponse> listMembers(Long groupId) {
        findGroup(groupId);
        return memberRepository.findByGroupId(groupId).stream().map(this::toMemberResponse).toList();
    }

    public StudyGroup findGroup(Long groupId) {
        return groupRepository.findById(groupId)
                .orElseThrow(() -> new NotFoundException("Group not found."));
    }

    private void applyCreateOrUpdate(StudyGroup group,
                                     String name,
                                     String description,
                                     String courseCode,
                                     String subject,
                                     GroupVisibility visibility,
                                     Integer maxMembers,
                                     List<String> tags) {
        group.setName(name);
        group.setDescription(description);
        group.setCourseCode(courseCode);
        group.setSubject(subject);
        group.setVisibility(toEntityVisibility(visibility));
        group.setMaxMembers(maxMembers);
        group.setTags(tags == null ? new ArrayList<>() : new ArrayList<>(tags));
    }

    private GroupResponse toGroupResponse(StudyGroup group) {
        return new GroupResponse(
                group.getId(),
                group.getName(),
                group.getDescription(),
                group.getCourseCode(),
                group.getSubject(),
                toDtoVisibility(group.getVisibility()),
                group.getMaxMembers(),
                memberRepository.countByGroupId(group.getId()),
                group.getTags(),
                group.getOwner().getId(),
                group.getCreatedAt()
        );
    }

    private GroupMemberResponse toMemberResponse(GroupMember member) {
        StudentUser user = member.getUser();
        return new GroupMemberResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                MemberRole.valueOf(member.getRole().name()),
                member.getJoinedAt()
        );
    }

    private StudyGroup.Visibility toEntityVisibility(GroupVisibility visibility) {
        if (visibility == null) {
            return StudyGroup.Visibility.PUBLIC;
        }
        return StudyGroup.Visibility.valueOf(visibility.name());
    }

    private GroupVisibility toDtoVisibility(StudyGroup.Visibility visibility) {
        return GroupVisibility.valueOf(visibility.name());
    }
}
