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
        var now = LocalDateTime.now();
        var payload = ResetPasswordTicketDTO.builder()
                .id(id)                 // ✅ 필드명은 userId로
                .issuedAt(now)
                .expiresAt(now.plus(ttl))
                .build();
        return oneTimeTokenService.issue(PURPOSE, ttl, payload);
    }

    @Override
    public Optional<ResetPasswordTicketDTO> consume(String token) {
        return oneTimeTokenService.consume(token, PURPOSE, ResetPasswordTicketDTO.class);
    }
    
    public Optional<ResetPasswordTicketDTO> peek(String token) {
        return oneTimeTokenService.peek(token, PURPOSE, ResetPasswordTicketDTO.class);
    }
}
