package com.school_project.api.controller;

import com.school_project.api.dto.GroupDtos.CreateGroupRequest;
import com.school_project.api.dto.GroupDtos.GroupMemberResponse;
import com.school_project.api.dto.GroupDtos.GroupResponse;
import com.school_project.api.dto.GroupDtos.JoinRequestResponse;
import com.school_project.api.dto.GroupDtos.UpdateGroupRequest;
import com.school_project.api.service.GroupService;
import lombok.RequiredArgsConstructor;
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

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @GetMapping
    public List<GroupResponse> listGroups(@RequestParam(required = false) String subject,
                                          @RequestParam(required = false) String search) {
        return groupService.listGroups(subject, search);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public GroupResponse createGroup(@RequestBody CreateGroupRequest request) {
        return groupService.createGroup(request);
    }

    @GetMapping("/{groupId}")
    public GroupResponse getGroup(@PathVariable Long groupId) {
        return groupService.getGroup(groupId);
    }

    @PutMapping("/{groupId}")
    public GroupResponse updateGroup(@PathVariable Long groupId, @RequestBody UpdateGroupRequest request) {
        return groupService.updateGroup(groupId, request);
    }

    @DeleteMapping("/{groupId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteGroup(@PathVariable Long groupId) {
        groupService.deleteGroup(groupId);
    }

    @PostMapping("/{groupId}/join")
    @ResponseStatus(HttpStatus.CREATED)
    public GroupMemberResponse joinGroup(@PathVariable Long groupId) {
        return groupService.joinGroup(groupId);
    }

    @DeleteMapping("/{groupId}/leave")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void leaveGroup(@PathVariable Long groupId) {
        groupService.leaveGroup(groupId);
    }

    @GetMapping("/{groupId}/members")
    public List<GroupMemberResponse> listMembers(@PathVariable Long groupId) {
        return groupService.listMembers(groupId);
    }

    @GetMapping("/{groupId}/pending")
    public List<JoinRequestResponse> listPendingRequests(@PathVariable Long groupId) {
        return groupService.listPendingRequests(groupId);
    }

    @PostMapping("/{groupId}/members/{userId}/approve")
    public GroupMemberResponse approveJoinRequest(@PathVariable Long groupId, @PathVariable Long userId) {
        return groupService.approveJoinRequest(groupId, userId);
    }

    @DeleteMapping("/{groupId}/members/{userId}/reject")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void rejectJoinRequest(@PathVariable Long groupId, @PathVariable Long userId) {
        groupService.rejectJoinRequest(groupId, userId);
    }
}
