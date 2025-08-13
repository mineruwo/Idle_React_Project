package com.fullstack.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.Map; // To match the current mock response structure

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatSessionDTO {
    private String chatRoomId;
    private String sessionId;
    private LocalDateTime createdAt;
    private CustomerDTO customer;
    // private List<Map<String, Object>> participants; // Can add later if needed
}
