package com.fullstack.config;

import org.springframework.context.ApplicationListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Component
public class WebSocketEventListener implements ApplicationListener<SessionConnectedEvent>, ApplicationListener<SessionDisconnectEvent> {

    // chatRoomId -> Set<sessionId>
    private final ConcurrentMap<String, Set<String>> activeChatRooms = new ConcurrentHashMap<>();

    @Override
    public void onApplicationEvent(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        String chatRoomId = headerAccessor.getFirstNativeHeader("chatRoomId");

        if (chatRoomId != null && sessionId != null) {
            activeChatRooms.computeIfAbsent(chatRoomId, k -> ConcurrentHashMap.newKeySet()).add(sessionId);
            System.out.println("Session connected: " + sessionId + " to room: " + chatRoomId);
            System.out.println("Active rooms: " + activeChatRooms);
        }
    }

    @Override
    public void onApplicationEvent(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();

        if (sessionId != null) {
            activeChatRooms.forEach((chatRoomId, sessions) -> {
                if (sessions.remove(sessionId)) {
                    System.out.println("Session disconnected: " + sessionId + " from room: " + chatRoomId);
                    if (sessions.isEmpty()) {
                        activeChatRooms.remove(chatRoomId);
                        System.out.println("Room removed: " + chatRoomId + " (no active sessions)");
                    }
                    System.out.println("Active rooms: " + activeChatRooms);
                    // 한 세션은 하나의 방에만 연결된다고 가정
                    return; 
                }
            });
        }
    }
}
