package com.fullstack.security.oauth;

import java.util.Collections;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
@Component
public class AppSnsVerifier {

	private final RestTemplate restTemplate = new RestTemplate();
	private final ObjectMapper objectMapper = new ObjectMapper();

	@Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;


	/**
	 * 구글 토큰 검증
	 */
	public JsonNode verifyGoogle(String idToken) throws Exception {
		GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(),
				GsonFactory.getDefaultInstance()).setAudience(Collections.singletonList(googleClientId)).build();

		GoogleIdToken googleIdToken = verifier.verify(idToken);
		if (googleIdToken == null) {
			throw new RuntimeException("구글 토큰 검증 실패");
		}

		return objectMapper.readTree(googleIdToken.getPayload().toString());
	}

	/**
	 * 카카오 토큰 검증
	 */
	public JsonNode verifyKakao(String accessToken) throws Exception {
		HttpHeaders headers = new HttpHeaders();
		headers.set("Authorization", "Bearer " + accessToken);

		HttpEntity<String> entity = new HttpEntity<>(headers);

		ResponseEntity<String> response = restTemplate.exchange("https://kapi.kakao.com/v2/user/me", HttpMethod.GET,
				entity, String.class);

		if (!response.getStatusCode().is2xxSuccessful()) {
			throw new RuntimeException("카카오 토큰 검증 실패");
		}

		return objectMapper.readTree(response.getBody());
	}

	/**
	 * 네이버 토큰 검증
	 */
	public JsonNode verifyNaver(String accessToken) throws Exception {
		HttpHeaders headers = new HttpHeaders();
		headers.set("Authorization", "Bearer " + accessToken);

		HttpEntity<String> entity = new HttpEntity<>(headers);

		ResponseEntity<String> response = restTemplate.exchange("https://openapi.naver.com/v1/nid/me", HttpMethod.GET,
				entity, String.class);

		if (!response.getStatusCode().is2xxSuccessful()) {
			throw new RuntimeException("네이버 토큰 검증 실패");
		}

		return objectMapper.readTree(response.getBody());
	}
}
