package com.school_project.api.controller;

import com.school_project.api.dto.MessageDtos.MessageResponse;
import com.school_project.api.dto.MessageDtos.SendMessageRequest;
import com.school_project.api.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/groups/{groupId}/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @GetMapping
    public List<MessageResponse> listMessages(@PathVariable Long groupId,
                                              @RequestParam(required = false) Long beforeMessageId,
                                              @RequestParam(defaultValue = "30") Integer limit) {
        return messageService.listMessages(groupId, beforeMessageId, limit);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MessageResponse sendMessage(@PathVariable Long groupId, @RequestBody SendMessageRequest request) {
        return messageService.sendMessage(groupId, request);
    }
}
