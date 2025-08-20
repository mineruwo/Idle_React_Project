package com.fullstack.service;

import java.time.Duration;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.fullstack.entity.CustomerEntity;
import com.fullstack.repository.CustomerRepository;
import com.fullstack.security.util.HashUtils;
import com.fullstack.security.util.ResetTokenUtils;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ResetTokenServiceImpl implements ResetTokenService {
	
	private final CustomerRepository customerRepository;

    private static final Duration RESET_TTL = Duration.ofMinutes(20);

    public record Token(String token, LocalDateTime expiresAt) {}

    @Transactional
    public Token issueResetToken(String email) {
        CustomerEntity customerEntity = customerRepository.findActiveByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("user_not_found"));

        String token = ResetTokenUtils.generateToken();      
        String hash = HashUtils.sha256(token);
    
        customerEntity.setResetTokenHash(hash);
        customerEntity.setResetExpiresAt(LocalDateTime.now().plus(RESET_TTL));
        customerEntity.setResetUsed(false);
        customerRepository.save(customerEntity);

        return new Token(token, customerEntity.getResetExpiresAt());
    }
}
