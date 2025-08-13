package com.fullstack.service;

import com.fullstack.model.ChatSessionDTO;
import java.util.Optional;

public interface ChatSessionService {
    Optional<ChatSessionDTO> getChatSessionDetailsByChatRoomId(String chatRoomId);
    ChatSessionDTO createChatSession(ChatSessionDTO chatSessionDTO);
    void deleteChatSessionByChatRoomId(String chatRoomId);
}
