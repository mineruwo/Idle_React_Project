package com.fullstack.controller;

import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.stereotype.Controller;
import com.fullstack.model.ChatMessage;

@Controller
public class WebSoketController {

    @MessageMapping("/chat/{chatRoomId}")
    @SendTo("/topic/messages/{chatRoomId}")
    public ChatMessage sendMessage(@DestinationVariable("chatRoomId") String chatRoomId, @Payload ChatMessage message, @Header("userId") String userId) {
        System.out.println("Received message for room " + chatRoomId + " from " + userId + ": " + message.getContent());
        message.setSender(userId);
        message.setChatRoomId(chatRoomId);
        return message;
    }
}