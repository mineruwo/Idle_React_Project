package com.fullstack.service;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fullstack.entity.CustomerEntity;
import com.fullstack.model.AppSnsLoginRequestDTO;
import com.fullstack.model.LoginResponseDTO;
import com.fullstack.model.TokenDTO;
import com.fullstack.repository.CustomerRepository;
import com.fullstack.security.oauth.AppSnsVerifier;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@RequiredArgsConstructor
@Log4j2
public class AppSnsServiceImpl implements AppSnsService {

	private final CustomerRepository customerRepository;
	private final TokenService tokenService;
	private final AppSnsVerifier appSnsVerifier;

	@Override
	public LoginResponseDTO handleSnsLogin(AppSnsLoginRequestDTO request) {
		String provider = request.getProvider();
		
		JsonNode userInfo;

		try {
			switch (provider) {
			case "google":
				userInfo = appSnsVerifier.verifyGoogle(request.getIdToken());
				break;
			case "kakao":
				userInfo = appSnsVerifier.verifyKakao(request.getAccessToken());
				break;
			case "naver":
				log.info("네이버 요청에서 받은 Access Token: {}", request.getAccessToken());
				userInfo = appSnsVerifier.verifyNaver(request.getAccessToken());
				break;
			default:
				throw new RuntimeException("지원하지 않는 Provider");
			}
		} catch (Exception e) {
			throw new RuntimeException("SNS 토큰 검증 실패", e);
		}

		String providerId = extractProviderId(provider, userInfo);

		// DB 조회
		CustomerEntity customer = customerRepository.findBySnsLoginProviderAndSnsProviderId(provider, providerId)
				.orElse(null);

		if (customer != null) {
			// 기존 계정 → 로그인 토큰 발급
			TokenDTO tokenDTO = tokenService.issue(customer.getId(), customer.getRole());

			return LoginResponseDTO.builder().id(customer.getId()).nickname(customer.getNickname())
					.role(customer.getRole()).idNum(customer.getIdNum()).accessToken(tokenDTO.getAccessToken())
					.refreshToken(tokenDTO.getRefreshToken()).build();
		} else {
			// 신규 계정 → Flutter에서 추가정보 입력 필요
			throw new RuntimeException("신규 회원입니다. 추가 정보 필요");
		}

	}

	private String extractProviderId(String provider, JsonNode userInfo) {
		switch (provider) {
		case "google":
			return userInfo.get("sub").asText();
		case "kakao":
			return userInfo.get("id").asText();
		case "naver":
			return userInfo.get("response").get("id").asText();
		default:
			return null;
		}
	}

}
