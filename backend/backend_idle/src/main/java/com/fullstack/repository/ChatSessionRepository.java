package com.fullstack.repository;

import com.fullstack.entity.ChatSessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSessionEntity, Long> {
    Optional<ChatSessionEntity> findByChatRoomId(String chatRoomId);
    void deleteByChatRoomId(String chatRoomId); // New method
}
