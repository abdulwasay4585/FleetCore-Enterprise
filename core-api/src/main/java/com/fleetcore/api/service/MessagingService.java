package com.fleetcore.api.service;

import com.fleetcore.api.model.MessageEntity;
import com.fleetcore.api.repository.MessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.Serializable;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * FleetCore Enterprise — Two-Way Dispatcher-Driver Messaging Service.
 * Feature F18: Real-time bidirectional messaging backed by PostgreSQL message table & JPA Repository.
 */
@Service
public class MessagingService {

    private final MessageRepository messageRepository;

    public MessagingService(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    public static class Message implements Serializable {
        public String messageId;
        public String senderId;
        public String senderRole;
        public String recipientId;
        public String content;
        public String priority;
        public String status;
        public String timestamp;

        public Message() {}

        public Message(String messageId, String senderId, String senderRole, String recipientId, String content, String priority, String status, String timestamp) {
            this.messageId = messageId;
            this.senderId = senderId;
            this.senderRole = senderRole;
            this.recipientId = recipientId;
            this.content = content;
            this.priority = priority;
            this.status = status;
            this.timestamp = timestamp;
        }
    }

    @Transactional
    public Message sendMessage(String senderId, String senderRole, String recipientId, String content, String priority) {
        MessageEntity entity = MessageEntity.builder()
                .senderId(senderId)
                .recipientId(recipientId)
                .messageBody(content)
                .priority(priority != null ? priority : "NORMAL")
                .isRead(false)
                .createdAt(OffsetDateTime.now())
                .build();

        entity = messageRepository.save(entity);

        return new Message(
                entity.getId().toString(),
                entity.getSenderId(),
                senderRole != null ? senderRole : "DISPATCHER",
                entity.getRecipientId(),
                entity.getMessageBody(),
                entity.getPriority(),
                entity.getIsRead() ? "READ" : "SENT",
                entity.getCreatedAt().toString()
        );
    }

    @Transactional(readOnly = true)
    public List<Message> getConversation(String userId1, String userId2) {
        return messageRepository.findConversation(userId1, userId2).stream()
                .map(e -> new Message(
                        e.getId().toString(),
                        e.getSenderId(),
                        e.getSenderId().startsWith("disp") ? "DISPATCHER" : "DRIVER",
                        e.getRecipientId(),
                        e.getMessageBody(),
                        e.getPriority(),
                        e.getIsRead() ? "READ" : "DELIVERED",
                        e.getCreatedAt() != null ? e.getCreatedAt().toString() : Instant.now().toString()
                ))
                .collect(Collectors.toList());
    }
}
