package com.fullstack.service;

import java.time.Duration;
import java.util.Optional;

import com.fullstack.model.OauthSignupTokenDTO;

public interface OauthTokenService {
	String issue(String provider, String providerId, String mode, Duration ttl);
    Optional<OauthSignupTokenDTO> peek(String token);
    void invalidate(String token);
}
