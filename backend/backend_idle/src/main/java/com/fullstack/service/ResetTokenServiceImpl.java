package com.fullstack.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fullstack.model.ResetPasswordTicketDTO;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class ResetTokenServiceImpl implements ResetTokenService {

	private static final String PURPOSE = "RESET_PASSWORD";

    private final OneTimeTokenService oneTimeTokenService;

    @Value("${reset.token.ttl-minutes:30}")
    private long defaultTtlMinutes;

    @Override
    public String issue(String id, Duration ttl) {
    	LocalDateTime now = LocalDateTime.now();
    	ResetPasswordTicketDTO payload = ResetPasswordTicketDTO.builder()
                .id(id)                 
                .issuedAt(now)
                .expiresAt(now.plus(ttl))
                .build();
        return oneTimeTokenService.issue(PURPOSE, ttl, payload);
    }

    @Override
    public Optional<ResetPasswordTicketDTO> peek(String token) {
        return oneTimeTokenService.peek(token, PURPOSE, ResetPasswordTicketDTO.class);
    }
    
    @Override
    public void invalidate(String token) {
    	oneTimeTokenService.invalidate(token);
    }
    
}
