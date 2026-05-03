package com.school_project.api.controller;

import com.school_project.api.dto.GroupDtos.CreateGroupRequest;
import com.school_project.api.dto.GroupDtos.GroupMemberResponse;
import com.school_project.api.dto.GroupDtos.GroupResponse;
import com.school_project.api.dto.GroupDtos.GroupVisibility;
import com.school_project.api.dto.GroupDtos.MemberRole;
import com.school_project.api.dto.GroupDtos.UpdateGroupRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    @GetMapping
    public List<GroupResponse> listGroups(@RequestParam(required = false) String subject,
                                          @RequestParam(required = false) String search) {
        return List.of(sampleGroup(1L, "Cloud Computing Final Prep"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public GroupResponse createGroup(@RequestBody CreateGroupRequest request) {
        return new GroupResponse(
                1L,
                request.name(),
                request.description(),
                request.courseCode(),
                request.subject(),
                request.visibility(),
                request.maxMembers(),
                1,
                request.tags(),
                1L,
                Instant.now()
        );
    }

    @GetMapping("/{groupId}")
    public GroupResponse getGroup(@PathVariable Long groupId) {
        return sampleGroup(groupId, "Cloud Computing Final Prep");
    }

    @PutMapping("/{groupId}")
    public GroupResponse updateGroup(@PathVariable Long groupId, @RequestBody UpdateGroupRequest request) {
        return new GroupResponse(
                groupId,
                request.name(),
                request.description(),
                request.courseCode(),
                request.subject(),
                request.visibility(),
                request.maxMembers(),
                6,
                request.tags(),
                1L,
                Instant.now()
        );
    }

    @DeleteMapping("/{groupId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteGroup(@PathVariable Long groupId) {
    }

    @PostMapping("/{groupId}/join")
    @ResponseStatus(HttpStatus.CREATED)
    public GroupMemberResponse joinGroup(@PathVariable Long groupId) {
        return new GroupMemberResponse(2L, "Sample Student", "student@mail.com", MemberRole.MEMBER, Instant.now());
    }

    @DeleteMapping("/{groupId}/leave")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void leaveGroup(@PathVariable Long groupId) {
    }

    @GetMapping("/{groupId}/members")
    public List<GroupMemberResponse> listMembers(@PathVariable Long groupId) {
        return List.of(
                new GroupMemberResponse(1L, "Group Owner", "owner@mail.com", MemberRole.OWNER, Instant.now()),
                new GroupMemberResponse(2L, "Sample Student", "student@mail.com", MemberRole.MEMBER, Instant.now())
        );
    }

    private GroupResponse sampleGroup(Long id, String name) {
        return new GroupResponse(
                id,
                name,
                "Shared group for cloud computing study sessions.",
                "CSE401",
                "Cloud Computing",
                GroupVisibility.PUBLIC,
                12,
                6,
                List.of("aws", "docker", "distributed-systems"),
                1L,
                Instant.now()
        );
    }
}
