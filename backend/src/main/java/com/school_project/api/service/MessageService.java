package com.school_project.api.service;

import com.school_project.api.dto.MessageDtos.MessageResponse;
import com.school_project.api.dto.MessageDtos.MessageType;
import com.school_project.api.dto.MessageDtos.SendMessageRequest;
import com.school_project.api.entity.ChatMessage;
import com.school_project.api.entity.StudentUser;
import com.school_project.api.entity.StudyGroup;
import com.school_project.api.entity.StudyMaterial;
import com.school_project.api.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final ChatMessageRepository messageRepository;
    private final GroupService groupService;
    private final CurrentUserService currentUserService;
    private final MaterialService materialService;

    @Transactional(readOnly = true)
    public List<MessageResponse> listMessages(Long groupId, Long beforeMessageId, Integer limit) {
        groupService.findGroup(groupId);
        PageRequest pageRequest = PageRequest.of(0, normalizeLimit(limit));
        List<ChatMessage> messages = beforeMessageId == null
                ? messageRepository.findByGroupIdOrderByCreatedAtDesc(groupId, pageRequest)
                : messageRepository.findByGroupIdAndIdLessThanOrderByCreatedAtDesc(groupId, beforeMessageId, pageRequest);
        return messages.stream()
                .sorted(Comparator.comparing(ChatMessage::getCreatedAt))
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public MessageResponse sendMessage(Long groupId, SendMessageRequest request) {
        StudyGroup group = groupService.findGroup(groupId);
        StudentUser user = currentUserService.getCurrentUser();
        StudyMaterial material = request.materialId() == null ? null : materialService.findMaterial(groupId, request.materialId());

        ChatMessage message = new ChatMessage();
        message.setGroup(group);
        message.setSender(user);
        message.setContent(request.content());
        message.setType(toEntityType(request.type()));
        message.setMaterial(material);
        return toResponse(messageRepository.save(message));
    }

    private int normalizeLimit(Integer limit) {
        if (limit == null) {
            return 30;
        }
        return Math.max(1, Math.min(limit, 100));
    }

    private MessageResponse toResponse(ChatMessage message) {
        return new MessageResponse(
                message.getId(),
                message.getGroup().getId(),
                message.getSender().getId(),
                message.getSender().getFullName(),
                message.getContent(),
                MessageType.valueOf(message.getType().name()),
                message.getMaterial() == null ? null : message.getMaterial().getId(),
                message.getCreatedAt(),
                message.getEditedAt()
        );
    }

    private ChatMessage.MessageType toEntityType(MessageType type) {
        if (type == null) {
            return ChatMessage.MessageType.TEXT;
        }
        return ChatMessage.MessageType.valueOf(type.name());
    }
}
