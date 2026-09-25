package com.fleetcore.api.repository;

import com.fleetcore.api.model.MessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<MessageEntity, UUID> {
    List<MessageEntity> findByRecipientIdOrderByCreatedAtDesc(String recipientId);
    List<MessageEntity> findByAssetIdOrderByCreatedAtDesc(UUID assetId);
    List<MessageEntity> findByPriority(String priority);

    @Query("SELECT m FROM MessageEntity m WHERE (m.senderId = :u1 AND m.recipientId = :u2) OR (m.senderId = :u2 AND m.recipientId = :u1) ORDER BY m.createdAt ASC")
    List<MessageEntity> findConversation(@Param("u1") String user1, @Param("u2") String user2);
}
