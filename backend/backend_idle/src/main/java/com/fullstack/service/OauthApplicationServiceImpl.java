package com.fullstack.service;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.fullstack.entity.CustomerEntity;
import com.fullstack.model.OauthLinkExistingDTO;
import com.fullstack.model.OauthSignupDTO;
import com.fullstack.model.OauthSignupRequestDTO;
import com.fullstack.model.OauthSignupTokenDTO;
import com.fullstack.model.TokenDTO;
import com.fullstack.security.util.TokenCookieUtils;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OauthApplicationServiceImpl implements OauthApplicationService {

	private final OauthTokenService oauthTokenService;
	private final SnsOnboardingService snsOnboardingService;
	private final TokenService tokenService;

	@Override
	public Map<String, Object> completeSignup(String token, OauthSignupRequestDTO signupRequestDTO,
			HttpServletResponse res) {

		OauthSignupTokenDTO t = oauthTokenService.peek(token)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰"));

		OauthSignupDTO ctx = OauthSignupDTO.builder().mode("signup").provider(t.getProvider())
				.providerId(t.getProviderId()).build();

		CustomerEntity customer = snsOnboardingService.completeSignup(ctx, signupRequestDTO);

		TokenDTO tokenDTO = tokenService.issue(customer.getId(), customer.getRole());

		TokenCookieUtils.setAccessTokenCookie(res, tokenDTO.getAccessToken(), tokenDTO.getAtExpiresIn());
		TokenCookieUtils.setRefreshTokenCookie(res, tokenDTO.getRefreshToken(), tokenDTO.getRtExpiresIn());
		TokenCookieUtils.setAuthHintCookie(res, true, tokenDTO.getRtExpiresIn());

		oauthTokenService.invalidate(token);

		return Map.of("id", customer.getId(), "role", customer.getRole(), "atExpiresIn", tokenDTO.getAtExpiresIn(),
				"rtExpiresIn", tokenDTO.getRtExpiresIn());
	}

	@Override
	public Map<String, Object> linkExisting(String token, OauthLinkExistingDTO linkExistingDTO,
			HttpServletResponse res) {
		OauthSignupTokenDTO t = oauthTokenService.peek(token)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰"));

		OauthSignupDTO ctx = OauthSignupDTO.builder().mode("link").provider(t.getProvider())
				.providerId(t.getProviderId()).build();

		CustomerEntity customer = snsOnboardingService.linkExisting(ctx, linkExistingDTO);

		TokenDTO tokens = tokenService.issue(customer.getId(), customer.getRole());
		TokenCookieUtils.setAccessTokenCookie(res, tokens.getAccessToken(), tokens.getAtExpiresIn());
		TokenCookieUtils.setRefreshTokenCookie(res, tokens.getRefreshToken(), tokens.getRtExpiresIn());
		TokenCookieUtils.setAuthHintCookie(res, true, tokens.getRtExpiresIn());

		oauthTokenService.invalidate(token);

		return Map.of("id", customer.getId(), "role", customer.getRole(), "atExpiresIn", tokens.getAtExpiresIn(),
				"rtExpiresIn", tokens.getRtExpiresIn());
	}
}
