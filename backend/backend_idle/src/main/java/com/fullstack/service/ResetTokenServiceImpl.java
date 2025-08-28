package com.fullstack.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class ResetTokenServiceImpl implements ResetTokenService {

	private static final String PURPOSE = "RESET_PASSWORD";

    private final OneTimeTokenService oneTimeTokenService;

    @Value("${reset.token.ttl-minutes:30}")
    private long defaultTtlMinutes;

    @Override
    public Token issueResetToken(String email) {
        return issueResetToken(email, Duration.ofMinutes(defaultTtlMinutes));
    }

    @Override
    public Token issueResetToken(String email, Duration ttl) {
        LocalDateTime exp = LocalDateTime.now().plus(ttl);
        String token = oneTimeTokenService.issue(PURPOSE, ttl, email);
        return new Token(token, exp);
    }

    @Override
    public Optional<String> consume(String token) {
        return oneTimeTokenService.consume(token, PURPOSE, String.class);
    }
}
