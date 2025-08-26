package com.fullstack.websocket;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ChatSessionManager {

    // sessionId를 키로, chatRoomId를 값으로 저장 (연결 종료 시 빠른 조회를 위함)
    private final Map<String, String> sessionIdToChatRoomId = new ConcurrentHashMap<>();
    
    // chatRoomId를 키로, 해당 채팅방에 참여한 sessionId 목록을 값으로 저장
    private final Map<String, Set<String>> chatRoomIdToSessionIds = new ConcurrentHashMap<>();

    /**
     * 새로운 웹소켓 세션을 등록합니다.
     * @param sessionId 웹소켓 세션 ID
     * @param chatRoomId 채팅방 ID
     */
    public void registerSession(String sessionId, String chatRoomId) {
        sessionIdToChatRoomId.put(sessionId, chatRoomId);
        
        // chatRoomId에 해당하는 Set이 없으면 새로 생성하고, sessionId를 추가
        chatRoomIdToSessionIds.computeIfAbsent(chatRoomId, key -> ConcurrentHashMap.newKeySet()).add(sessionId);
        
        System.out.println("Session registered: " + sessionId + " for chatRoomId: " + chatRoomId);
    }

    /**
     * 웹소켓 세션을 제거합니다.
     * @param sessionId 웹소켓 세션 ID
     */
    public void deregisterSession(String sessionId) {
        String chatRoomId = sessionIdToChatRoomId.remove(sessionId);
        if (chatRoomId != null) {
            Set<String> sessions = chatRoomIdToSessionIds.get(chatRoomId);
            if (sessions != null) {
                sessions.remove(sessionId);
                // 만약 해당 채팅방에 아무도 없으면 Map에서 제거
                if (sessions.isEmpty()) {
                    chatRoomIdToSessionIds.remove(chatRoomId);
                }
            }
        }
        System.out.println("Session deregistered: " + sessionId);
    }

    /**
     * 특정 채팅방에 활성화된 모든 세션 ID를 조회합니다.
     * @param chatRoomId 채팅방 ID
     * @return 해당 채팅방의 모든 세션 ID Set
     */
    public Set<String> getActiveSessions(String chatRoomId) {
        return chatRoomIdToSessionIds.get(chatRoomId);
    }

    /**
     * 현재 활성화된 모든 채팅방과 해당 채팅방의 세션 ID 목록을 조회합니다.
     * @return chatRoomId를 키로, 해당 채팅방의 모든 세션 ID Set을 값으로 하는 Map
     */
    public Map<String, Set<String>> getAllActiveSessions() {
        return chatRoomIdToSessionIds;
    }
}
