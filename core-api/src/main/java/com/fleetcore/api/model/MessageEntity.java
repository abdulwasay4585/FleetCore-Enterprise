package com.fleetcore.api.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "sender_id", nullable = false, length = 100)
    private String senderId;

    @Column(name = "recipient_id", nullable = false, length = 100)
    private String recipientId;

    @Column(name = "asset_id")
    private UUID assetId;

    @Column(name = "message_body", nullable = false, columnDefinition = "TEXT")
    private String messageBody;

    @Column(length = 30)
    private String priority; // NORMAL, URGENT, EMERGENCY_SOS

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "is_read")
    private Boolean isRead = false;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
    }
}
