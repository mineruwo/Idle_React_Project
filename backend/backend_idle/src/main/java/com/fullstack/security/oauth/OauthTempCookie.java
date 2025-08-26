package com.fullstack.security.oauth;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fullstack.model.OauthInfoDTO;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OauthTempCookie {
	
	private final ObjectMapper objectMapper;
	
	@Value("${security.oauth.temp-secret}")
	private String secret;
	@Value("${security.oauth.temp-ttl-seconds:300}")
    private long defaultTtlSeconds;
	
	private SecretKeySpec keySpec;
	
	@PostConstruct
    void init() {
        this.keySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
    }
	
	public String sign(String provider, String providerId, String email, boolean emailVerified, String flow) {
        long exp = Instant.now().getEpochSecond() + defaultTtlSeconds;
        OauthInfoDTO info = new OauthInfoDTO(provider, providerId, email, emailVerified, flow, exp);
        return sign(info);
    }
	
	public String sign(OauthInfoDTO info) {
        try {
            String payloadJson = objectMapper.writeValueAsString(info);
            String payloadB64 = Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(payloadJson.getBytes(StandardCharsets.UTF_8));
            String sig = hmac(payloadB64);
            return payloadB64 + "." + sig; // <payload>.<signature>
        } catch (Exception e) {
            throw new IllegalStateException("oauth_tmp sign failed", e);
        }
    }
	
	public OauthInfoDTO verify(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 2) throw new IllegalArgumentException("invalid token format");

            String payloadB64 = parts[0];
            String sig = parts[1];
            String expected = hmac(payloadB64);
            if (!constantTimeEquals(sig, expected)) {
                throw new IllegalArgumentException("bad signature");
            }

            String json = new String(Base64.getUrlDecoder().decode(payloadB64), StandardCharsets.UTF_8);
            OauthInfoDTO info = objectMapper.readValue(json, OauthInfoDTO.class);

            long now = Instant.now().getEpochSecond();
            if (info.getExp() < now) throw new IllegalArgumentException("expired");

            return info;
        } catch (Exception e) {
            throw new IllegalArgumentException("invalid oauth_tmp", e);
        }
    }
	
	private String hmac(String data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(keySpec);
        byte[] raw = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return Base64.getUrlEncoder().withoutPadding().encodeToString(raw);
    }
	
	private static boolean constantTimeEquals(String a, String b) {
        if (a.length() != b.length()) return false;
        int res = 0;
        for (int i = 0; i < a.length(); i++) res |= a.charAt(i) ^ b.charAt(i);
        return res == 0;
    }

}
