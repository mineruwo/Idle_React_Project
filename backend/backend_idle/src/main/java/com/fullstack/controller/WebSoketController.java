package com.fullstack.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;
import com.fullstack.model.ChatMessage;

@Controller
public class WebSoketController {

    // 클라이언트가 "/app/chat"으로 메시지를 보내면 이 메서드가 호출됩니다.
    // @MessageMapping은 클라이언트의 메시지 전송 경로를 매핑합니다.
    @MessageMapping("/chat")
    // 이 메서드의 반환 값은 "/topic/messages"를 구독하는 모든 클라이언트에게 전송됩니다.
    // @SendTo는 메시지 브로커를 통해 메시지를 보낼 목적지를 지정합니다.
    @SendTo("/topic/messages")
    public ChatMessage sendMessage(ChatMessage message, SimpMessageHeaderAccessor headerAccessor) {
        // 받은 메시지를 그대로 반환하여 모든 구독자에게 에코합니다.
        // 실제 애플리케이션에서는 메시지를 저장하거나 다른 로직을 수행할 수 있습니다.
        System.out.println("Received message: " + message.getContent());
        message.setSender(headerAccessor.getSessionId());
        return message;
    }
}