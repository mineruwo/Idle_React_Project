package com.fullstack.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.fullstack.model.SnsSignupDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SnsTokenServiceImpl implements SnsTokenService {
	
	private static final String PURPOSE = "SNS_SIGNUP";
	private final OneTimeTokenService oneTimeTokenService;

	@Override
    public String issue(String provider, String providerId, String mode, Duration ttl) {
        LocalDateTime now = LocalDateTime.now();
        SnsSignupDTO dto = new SnsSignupDTO(
                UUID.randomUUID().toString(), provider, providerId, mode, now, now.plus(ttl)
        );
        return oneTimeTokenService.issue(PURPOSE, ttl, dto);
    }
	
	@Override
    public Optional<SnsSignupDTO> consume(String token) {
        return oneTimeTokenService.consume(token, PURPOSE, SnsSignupDTO.class);
    }
	
}
