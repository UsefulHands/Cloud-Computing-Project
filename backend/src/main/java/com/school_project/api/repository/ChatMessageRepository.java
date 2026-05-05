package com.school_project.api.repository;

import com.school_project.api.entity.ChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByGroupIdOrderByCreatedAtDesc(Long groupId, Pageable pageable);

    List<ChatMessage> findByGroupIdAndIdLessThanOrderByCreatedAtDesc(Long groupId, Long id, Pageable pageable);

    void deleteByGroupId(Long groupId);

    void deleteByMaterialId(Long materialId);
}
