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
import org.springframework.security.oauth2.client.web.HttpSessionOAuth2AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.fullstack.entity.CustomerEntity;
import com.fullstack.model.TokenDTO;
import com.fullstack.repository.CustomerRepository;
import com.fullstack.security.jwt.JWTUtil;
import com.fullstack.security.util.NicknameUtil;
import com.fullstack.security.util.TokenCookieUtils;
import com.fullstack.service.TokenService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {
	
	private final CustomerRepository customerRepository;
	private final TokenService tokenService;
	
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
            String nickname   = extractNickname(provider, attrs);
            
	        CustomerEntity customer = customerRepository
	                .findBySnsLoginProviderAndSnsProviderId(provider, providerId)
	                .orElse(null);
	        
	        if (customer == null) {
                // 연동 없으면 이메일로 기존 계정 찾기 → 있으면 연동, 없으면 신규 생성
	        	 if (!isBlank(email)) {
                	customer = customerRepository.findById(email).orElse(null);
                }
                if (customer != null) {
                    // 기존 로컬 계정에 연동
                	customer.setSnsLoginProvider(provider);
                	customer.setSnsProviderId(providerId);
                    customerRepository.save(customer);
                } else {
                    // 신규 생성
                	String loginId = chooseLoginId(email, provider, providerId);
                	customer = new CustomerEntity();
                	customer.setId(loginId);
                	customer.setPasswordEnc(null);
                	customer.setCustomName(!isBlank(nickname) ? nickname : "새 사용자");
                	String picked = NicknameUtil.pickAvailable(
                            nickname, provider, customerRepository::existsByNickname);
                	customer.setNickname(picked);
                    customer.setSnsLoginProvider(provider);
                    customer.setSnsProviderId(providerId);
                    customer.setCreatedAt(LocalDateTime.now());
                    customer.setIsLefted(false);
                    customer.setUserPoint(0);
                    customerRepository.save(customer);
                }
            }

            // === 여기서부터 컨트롤러와 동일한 쿠키 발급 방식 ===
            TokenDTO tokenDTO = tokenService.issue(customer.getId(), customer.getRole());

            TokenCookieUtils.setAccessTokenCookie(res, tokenDTO.getAccessToken(), tokenDTO.getAtExpiresIn());
            TokenCookieUtils.setRefreshTokenCookie(res, tokenDTO.getRefreshToken(), tokenDTO.getRtExpiresIn());
            TokenCookieUtils.setAuthHintCookie(res, true, tokenDTO.getRtExpiresIn());

            res.sendRedirect(frontendBaseUrl + "/");

        } catch (Exception e) {
            e.printStackTrace();
            res.sendRedirect(frontendBaseUrl + "/login?error=oauth2");
        }
    }
	
	 private String chooseLoginId(String email, String provider, String providerId) {
	        if (!isBlank(email) && !customerRepository.existsById(email)) {
	            return email;
	        }
	        String base = "sns-" + provider + "-" + providerId + "@" + provider + ".oauth";
	        if (!customerRepository.existsById(base)) return base;
	        return base + "-" + UUID.randomUUID().toString().substring(0, 8);
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
    
    private String extractNickname(String provider, Map<String, Object> attrs) {
        switch (provider) {
            case "google": return String.valueOf(attrs.getOrDefault("name", ""));
            case "kakao": {
                Map<?, ?> acc = (Map<?, ?>) attrs.get("kakao_account");
                Map<?, ?> profile = acc == null ? null : (Map<?, ?>) acc.get("profile");
                Object nick = profile == null ? null : profile.get("nickname");
                return nick == null ? "" : String.valueOf(nick);
            }
            case "naver": {
                Map<?, ?> resp = (Map<?, ?>) attrs.get("response");
                Object nick = resp == null ? null : resp.get("nickname");
                return nick == null ? "" : String.valueOf(nick);
            }
            default: return "";
        }
    }
    
    private boolean isBlank(String s) { return s == null || s.isBlank(); }

}
