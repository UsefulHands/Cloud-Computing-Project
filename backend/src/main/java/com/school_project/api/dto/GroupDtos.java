package com.school_project.api.dto;

import java.io.Serializable;
import java.time.Instant;
import java.util.List;

public final class GroupDtos {
    private GroupDtos() {
    }

    public enum GroupVisibility {
        PUBLIC,
        PRIVATE
    }

    public enum MemberRole {
        OWNER,
        MODERATOR,
        MEMBER
    }

    public record CreateGroupRequest(
            String name,
            String description,
            String courseCode,
            String subject,
            GroupVisibility visibility,
            Integer maxMembers,
            List<String> tags
    ) implements Serializable {
    }

    public record UpdateGroupRequest(
            String name,
            String description,
            String courseCode,
            String subject,
            GroupVisibility visibility,
            Integer maxMembers,
            List<String> tags
    ) implements Serializable{
    }

    public record GroupResponse(
            Long id,
            String name,
            String description,
            String courseCode,
            String subject,
            GroupVisibility visibility,
            Integer maxMembers,
            Integer memberCount,
            List<String> tags,
            Long ownerId,
            Instant createdAt,
            String myMembershipStatus,
            String myRole
    ) implements Serializable {
    }

    public record GroupMemberResponse(
            Long userId,
            String fullName,
            String email,
            MemberRole role,
            String status,
            Instant joinedAt
    ) implements Serializable{
    }

    public record JoinRequestResponse(
            Long userId,
            String fullName,
            String email,
            Instant requestedAt
    ) implements Serializable{
    }
}
