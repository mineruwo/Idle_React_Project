package com.fullstack.service;

import java.time.Duration;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.fullstack.model.OauthSignupTokenDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OauthTokenServiceImpl implements OauthTokenService {

	private static final String PURPOSE = "SNS_SIGNUP";
	private final OneTimeTokenService oneTimeTokenService;
	
	@Override
    public String issue(String provider, String providerId, String mode, Duration ttl) {
        // 필요시 발급시각/만료시각을 payload에 넣어도 됨
        OauthSignupTokenDTO payload = OauthSignupTokenDTO.builder()
                .provider(provider)
                .providerId(providerId)
                .mode(mode)
                .build();
        return oneTimeTokenService.issue(PURPOSE, ttl, payload);
    }

    @Override
    public Optional<OauthSignupTokenDTO> peek(String token) {
        return oneTimeTokenService.peek(token, PURPOSE, OauthSignupTokenDTO.class);
    }

    @Override
    public void invalidate(String token) {
        oneTimeTokenService.invalidate(token);
    }
	
}
