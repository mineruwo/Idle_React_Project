package com.fullstack.service;

import com.fullstack.entity.ChatSessionEntity;
import com.fullstack.entity.CustomerEntity;
import com.fullstack.model.ChatSessionDTO;
import com.fullstack.model.CustomerDTO;
import com.fullstack.repository.ChatSessionRepository;
import com.fullstack.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID; // For sessionId generation
import org.springframework.transaction.annotation.Transactional; // New import

@Service
public class ChatSessionServiceImpl implements ChatSessionService {

    @Autowired
    private ChatSessionRepository chatSessionRepository;

    @Autowired
    private CustomerRepository customerRepository; // To link with existing customers

    @Override
    public Optional<ChatSessionDTO> getChatSessionDetailsByChatRoomId(String chatRoomId) {
        return chatSessionRepository.findByChatRoomId(chatRoomId)
                .map(this::convertToDTO);
    }

    @Override
    @Transactional // Add this annotation
    public ChatSessionDTO createChatSession(ChatSessionDTO chatSessionDTO) {
        CustomerEntity customerEntity = null;
        if (chatSessionDTO.getCustomer() != null && chatSessionDTO.getCustomer().getId() != null && !chatSessionDTO.getCustomer().getId().isEmpty()) {
            // Attempt to find the customer if an ID is provided
            customerEntity = customerRepository.findById(chatSessionDTO.getCustomer().getId())
                    .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + chatSessionDTO.getCustomer().getId()));
        }
        // If customerEntity is still null, it means it's a non-member chat session

        ChatSessionEntity chatSessionEntity = ChatSessionEntity.builder()
                .chatRoomId(chatSessionDTO.getChatRoomId())
                .sessionId(UUID.randomUUID().toString()) // Generate a unique session ID
                .createdAt(LocalDateTime.now())
                .customer(customerEntity) // customer can be null for non-members
                .build();

        ChatSessionEntity savedEntity = chatSessionRepository.save(chatSessionEntity);
        return convertToDTO(savedEntity);
    }

    @Override
    @Transactional // Ensure deletion is transactional
    public void deleteChatSessionByChatRoomId(String chatRoomId) {
        chatSessionRepository.deleteByChatRoomId(chatRoomId);
    }

    private ChatSessionDTO convertToDTO(ChatSessionEntity entity) {
        CustomerDTO customerDTO = null;
        if (entity.getCustomer() != null) {
            customerDTO = CustomerDTO.builder()
                    .id(entity.getCustomer().getId())
                    .customName(entity.getCustomer().getCustomName())
                    .role(entity.getCustomer().getRole())
                    .createdAt(entity.getCustomer().getCreatedAt())
                    .build();
        }

        return ChatSessionDTO.builder()
                .chatRoomId(entity.getChatRoomId())
                .sessionId(entity.getSessionId())
                .createdAt(entity.getCreatedAt())
                .customer(customerDTO) // customerDTO can be null
                .build();
    }
}
