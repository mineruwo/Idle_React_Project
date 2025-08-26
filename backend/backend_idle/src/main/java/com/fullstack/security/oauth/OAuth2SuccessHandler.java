package com.fullstack.security.oauth;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.client.web.HttpSessionOAuth2AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.fullstack.entity.CustomerEntity;
import com.fullstack.repository.CustomerRepository;
import com.fullstack.security.jwt.JWTUtil;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {
	
	private final JWTUtil jwtUtil;
	private final CustomerRepository customerRepository;
	private final OauthTempCookie oauthTempCookie;
	
	private final HttpSessionOAuth2AuthorizationRequestRepository authReqRepo =
            new HttpSessionOAuth2AuthorizationRequestRepository();
	
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
            String email = extractEmail(provider, attrs); 
            boolean emailVerified = extractEmailVerified(provider, attrs);
	        
            OAuth2AuthorizationRequest authReq = authReqRepo.removeAuthorizationRequest(req, res);
            String flow = "login";
            if (authReq != null && authReq.getAdditionalParameters().get("flow") != null) {
                flow = String.valueOf(authReq.getAdditionalParameters().get("flow"));
            }
            
	        CustomerEntity customer = customerRepository
	                .findBySnsLoginProviderAndSnsProviderId(provider, providerId)
	                .orElse(null);
	        
	        // 계정 존재 -> 로그인
	        if (customer != null) {
	        	// JWT 발급
		        String accessToken = jwtUtil.generateAccessToken(customer.getId(), customer.getRole());
		        String refreshToken = jwtUtil.generateRefreshToken(customer.getId());

		        // HttpOnly 쿠키로 세팅 (크로스 도메인이면 SameSite=None; Secure 필요)
		        res.addHeader("Set-Cookie", cookie("accessToken", accessToken, true));
		        res.addHeader("Set-Cookie", cookie("refreshToken", refreshToken, true));
		        
		        res.sendRedirect(frontendBaseUrl + "/oauth2/success");
                return;
            }
	        
	        // 계정 X
	        String payload = oauthTempCookie.sign(provider, providerId, email, emailVerified, flow);
	        String tmpCookie = ResponseCookie.from("oauth_tmp", payload)
                    .httpOnly(true)
                    .secure(false)                 // 운영: true (HTTPS)
                    .path("/")
                    .sameSite("Lax")              // 크로스 도메인이면 "None"
                    .maxAge(Duration.ofMinutes(5))
                    .build()
                    .toString();
            res.addHeader("Set-Cookie", tmpCookie);

	        boolean emailExists = (email != null) && customerRepository.findById(email).isPresent();

	        if (emailExists) {
	            // 로컬 계정 존재 → 연동 동의 화면
	        	String url = frontendBaseUrl + "/oauth/consent?type=link&email="
                        + URLEncoder.encode(email, StandardCharsets.UTF_8);
                res.sendRedirect(url);
	        } else {
	            // 로컬 계정 없음 → SNS 정보로 회원가입 동의 화면
	        	res.sendRedirect(frontendBaseUrl + "/oauth/consent?type=signup");
	        }  
		} catch (Exception e) {
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
            case "naver": {
                Map<?, ?> resp = (Map<?, ?>) attrs.get("response");
                return resp != null ? (String) resp.get("id") : null;
            }
            case "kakao":
                Object id = attrs.get("id");
                return id != null ? String.valueOf(id) : null;
            default:
                throw new IllegalArgumentException("Unsupported provider: " + provider);
        }
    }
    
    private String extractEmail(String provider, Map<String, Object> attrs) {
        switch (provider) {
            case "google":
                return (String) attrs.get("email");
            case "kakao": {
                Map<?, ?> account = (Map<?, ?>) attrs.get("kakao_account");
                return (account != null) ? (String) account.get("email") : null;
            }
            case "naver": {
                Map<?, ?> resp = (Map<?, ?>) attrs.get("response");
                return (resp != null) ? (String) resp.get("email") : null;
            }
            default:
                return null;
        }
    }
    
    private boolean extractEmailVerified(String provider, Map<String, Object> attrs) {
        switch (provider) {
            case "google":
                // OIDC 표준: email_verified
                return Boolean.TRUE.equals(attrs.get("email_verified"));
            case "kakao": {
                Map<?, ?> account = (Map<?, ?>) attrs.get("kakao_account");
                // 카카오 스펙: is_email_verified (있는 경우)
                Object v = (account != null) ? account.get("is_email_verified") : null;
                return Boolean.TRUE.equals(v);
            }
            case "naver":
                // 네이버는 명시 필드가 없어서 보수적으로 false 처리(정책에 따라 조정)
                return false;
            default:
                return false;
        }
    }

}
