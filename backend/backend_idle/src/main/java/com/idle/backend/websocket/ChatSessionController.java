package com.idle.backend.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/admin/chat-sessions")
@RequiredArgsConstructor
public class ChatSessionController {

    private final ChatSessionManager chatSessionManager;

    @GetMapping
    public ResponseEntity<Map<String, Set<String>>> getAllActiveChatSessions() {
        Map<String, Set<String>> activeSessions = chatSessionManager.getAllActiveSessions();
        return ResponseEntity.ok(activeSessions);
    }
}
