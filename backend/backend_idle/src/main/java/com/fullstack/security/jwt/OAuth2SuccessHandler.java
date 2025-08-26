package com.fullstack.security.jwt;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.fullstack.entity.CustomerEntity;
import com.fullstack.repository.CustomerRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {
	
	private final JWTUtil jwtUtil;
	private final CustomerRepository customerRepository;
	@Value("${frontend.base-url}")
    private String frontendBaseUrl;
	
	@Override
    public void onAuthenticationSuccess(HttpServletRequest req, HttpServletResponse res,
                                        Authentication authentication) throws IOException {
		
		try {
			OAuth2AuthenticationToken oauth = (OAuth2AuthenticationToken) authentication;
			String provider = oauth.getAuthorizedClientRegistrationId();
			
			OAuth2User principal = oauth.getPrincipal();
	        Map<String, Object> attrs = principal.getAttributes();
	        
	        String providerId = extractProviderId(provider, attrs);
	        String email = (String) attrs.get("email");
	        
	        CustomerEntity customer = customerRepository
	                .findBySnsLoginProviderAndSnsProviderId(provider, providerId)
	                .orElse(null);
	        
	        if (customer == null) {
                String url = frontendBaseUrl + "/signup"
                        + "?provider=" + URLEncoder.encode(provider, StandardCharsets.UTF_8)
                        + (email != null ? "&email=" + URLEncoder.encode(email, StandardCharsets.UTF_8) : "");
                res.sendRedirect(url);
                return;
            }
	        
	        // JWT 발급
	        String accessToken = jwtUtil.generateAccessToken(customer.getId(), customer.getRole());
	        String refreshToken = jwtUtil.generateRefreshToken(customer.getId());

	        // HttpOnly 쿠키로 세팅 (크로스 도메인이면 SameSite=None; Secure 필요)
	        res.addHeader("Set-Cookie", cookie("accessToken", accessToken, true));
	        res.addHeader("Set-Cookie", cookie("refreshToken", refreshToken, true));

	        res.sendRedirect(frontendBaseUrl + "/oauth2/success");
		} catch (Exception e) {
            // 디버깅을 위해 임시로 리다이렉트 (운영에선 로깅 후 /login?error 처리)
            e.printStackTrace();
            res.sendRedirect(frontendBaseUrl + "/login?error=oauth2");
        }
    }

    private String cookie(String name, String value, boolean httpOnly) {
        // 필요에 맞게 도메인/Max-Age/SameSite 조정
        return ResponseCookie.from(name, value)
                .httpOnly(httpOnly)
                .secure(false)              // 배포에서는 true + HTTPS
                .path("/")
                .sameSite("Lax")           // 프론트/백이 다른 도메인이면 "None"
                .maxAge(Duration.ofHours(1))
                .build()
                .toString();
    }
    
    private String extractProviderId(String provider, Map<String, Object> attrs) {
        switch (provider) {
            case "google":
                return (String) attrs.get("sub");
            case "naver":
                Map<?,?> resp = (Map<?,?>) attrs.get("response");
                return resp != null ? (String) resp.get("id") : null;
            case "kakao":
                Object id = attrs.get("id");
                return id != null ? String.valueOf(id) : null;
            default:
                throw new IllegalArgumentException("Unsupported provider: " + provider);
        }
    }

}
