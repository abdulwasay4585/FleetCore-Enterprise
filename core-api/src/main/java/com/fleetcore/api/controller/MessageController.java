package com.fleetcore.api.controller;

import com.fleetcore.api.service.MessagingService;
import com.fleetcore.api.service.MessagingService.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * REST API — Two-Way Messaging Controller (F18).
 *   POST /api/v1/messages/send
 *   GET  /api/v1/messages/conversation?user1={id}&user2={id}
 */
@RestController
@RequestMapping("/api/v1/messages")
public class MessageController {

    private final MessagingService messagingService;

    public MessageController(MessagingService messagingService) {
        this.messagingService = messagingService;
    }

    @PostMapping("/send")
    public ResponseEntity<Message> sendMessage(@RequestBody SendMessageRequest req) {
        Message msg = messagingService.sendMessage(req.senderId, req.senderRole, req.recipientId, req.content, req.priority);
        return ResponseEntity.ok(msg);
    }

    @GetMapping("/conversation")
    public ResponseEntity<List<Message>> getConversation(@RequestParam String user1, @RequestParam String user2) {
        return ResponseEntity.ok(messagingService.getConversation(user1, user2));
    }

    public static class SendMessageRequest {
        public String senderId;
        public String senderRole;
        public String recipientId;
        public String content;
        public String priority;
    }
}
