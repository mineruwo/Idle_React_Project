package com.idle.backend.websocket;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor // final 필드에 대한 생성자를 자동으로 생성
public class ChatChannelInterceptor implements ChannelInterceptor {

    private final ChatSessionManager sessionManager;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        // STOMP CONNECT 명령어일 때 세션 등록 처리
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            // 클라이언트가 보낸 헤더에서 chatRoomId 추출
            String chatRoomId = accessor.getFirstNativeHeader("chatRoomId");
            String sessionId = accessor.getSessionId();

            if (chatRoomId != null && sessionId != null) {
                sessionManager.registerSession(sessionId, chatRoomId);
            }
        }
        return message;
    }
}
