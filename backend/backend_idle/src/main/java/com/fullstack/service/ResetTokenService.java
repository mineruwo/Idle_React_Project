package com.fullstack.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;

public interface ResetTokenService {

	record Token(String token, LocalDateTime expiresAt) {}
    Token issueResetToken(String email);
    Token issueResetToken(String email, Duration ttl);
    Optional<String> consume(String token);
}
