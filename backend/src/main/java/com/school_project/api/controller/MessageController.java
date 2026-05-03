package com.school_project.api.controller;

import com.school_project.api.dto.MessageDtos.MessageResponse;
import com.school_project.api.dto.MessageDtos.MessageType;
import com.school_project.api.dto.MessageDtos.SendMessageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/groups/{groupId}/messages")
public class MessageController {

    @GetMapping
    public List<MessageResponse> listMessages(@PathVariable Long groupId,
                                              @RequestParam(required = false) Long beforeMessageId,
                                              @RequestParam(defaultValue = "30") Integer limit) {
        return List.of(new MessageResponse(
                1L,
                groupId,
                1L,
                "Group Owner",
                "Today we will review distributed storage notes.",
                MessageType.TEXT,
                null,
                Instant.now(),
                null
        ));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MessageResponse sendMessage(@PathVariable Long groupId, @RequestBody SendMessageRequest request) {
        return new MessageResponse(
                2L,
                groupId,
                1L,
                "Sample Student",
                request.content(),
                request.type(),
                request.materialId(),
                Instant.now(),
                null
        );
    }
}
