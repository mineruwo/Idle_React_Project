package com.fullstack.security.oauth;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.fullstack.entity.CustomerEntity;
import com.fullstack.model.TokenDTO;
import com.fullstack.repository.CustomerRepository;
import com.fullstack.security.util.TokenCookieUtils;
import com.fullstack.service.SnsSignupService;
import com.fullstack.service.TokenService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {
	
	private final CustomerRepository customerRepository;
	private final TokenService tokenService;
	private final SnsSignupService snsSignupService;
	
	@Value("${frontend.base-url}")
    private String frontendBaseUrl;
	
	private static final Duration OAUTH_SIGNUP_TTL = Duration.ofMinutes(10);
	
	@Override
    public void onAuthenticationSuccess(HttpServletRequest req, HttpServletResponse res,
                                        Authentication authentication) throws IOException {
		
		try {
			OAuth2AuthenticationToken oauth = (OAuth2AuthenticationToken) authentication;
			String provider = oauth.getAuthorizedClientRegistrationId();
			
			OAuth2User principal = oauth.getPrincipal();
	        Map<String, Object> attrs = principal.getAttributes();
	        
	        String providerId = extractProviderId(provider, attrs);        
            
	        CustomerEntity customer = customerRepository
	                .findBySnsLoginProviderAndSnsProviderId(provider, providerId)
	                .orElse(null);
	        
	        // 로그인
	        if (customer != null) {
                TokenDTO tokenDTO = tokenService.issue(customer.getId(), customer.getRole());
                TokenCookieUtils.setAccessTokenCookie(res, tokenDTO.getAccessToken(), tokenDTO.getAtExpiresIn());
                TokenCookieUtils.setRefreshTokenCookie(res, tokenDTO.getRefreshToken(), tokenDTO.getRtExpiresIn());
                TokenCookieUtils.setAuthHintCookie(res, true, tokenDTO.getRtExpiresIn());
                res.sendRedirect(frontendBaseUrl + "/");
                return;
            }
	        
	        String mode = "choose";
	      	        
	        String signupToken = snsSignupService.issue(provider, providerId, mode, OAUTH_SIGNUP_TTL);
	        
	        ResponseCookie signupCookie = ResponseCookie.from("oauth_signup_token",
                    URLEncoder.encode(signupToken, StandardCharsets.UTF_8))
	        	.httpOnly(true)
	            .secure(false)          // TODO: 운영 배포 시 true
	            .sameSite("Lax")
	            .path("/")
	            .maxAge(OAUTH_SIGNUP_TTL)
	            .build();
	        
	        res.addHeader("Set-Cookie", signupCookie.toString());
	        
	        res.sendRedirect(frontendBaseUrl + "/oauth2/land?mode=choose");
        } catch (Exception e) {
            e.printStackTrace();
            res.sendRedirect(frontendBaseUrl + "/login?error=oauth2");
        }
    }
    
	private String extractProviderId(String provider, Map<String, Object> attrs) {
	    switch (provider) {
	        case "google":
	            // google은 sub가 id. 혹시 라이브러리/환경에 따라 id만 있는 경우도 대비
	            return asString(attrs.getOrDefault("sub", attrs.get("id")));
	        case "kakao":
	            // kakao는 기본 id가 최상위. (평탄화 전이면 그대로, 후면 어차피 최상위)
	            return asString(attrs.get("id"));
	        case "naver": {
	            // ✅ 평탄화된 경우: attrs.get("id")
	            // ✅ 평탄화 전(기존): attrs.get("response.id")
	            Object id = attrs.get("id");
	            if (id == null) {
	                Map<String,Object> resp = asMap(attrs.get("response"));
	                if (resp != null) id = resp.get("id");
	            }
	            return asString(id);
	        }
	        default:
	            return null;
	    }
	}
	
	private static String asString(Object o) { return o == null ? null : String.valueOf(o); }
	@SuppressWarnings("unchecked")
	private static Map<String, Object> asMap(Object o) { return (o instanceof Map) ? (Map<String, Object>) o : null; }

}
