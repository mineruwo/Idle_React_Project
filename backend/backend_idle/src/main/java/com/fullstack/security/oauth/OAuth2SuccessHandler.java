package com.fullstack.security.oauth;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.fullstack.entity.CustomerEntity;
import com.fullstack.model.TokenDTO;
import com.fullstack.repository.CustomerRepository;
import com.fullstack.security.util.TokenCookieUtils;
import com.fullstack.service.OauthTokenService;
import com.fullstack.service.TokenService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {
	
	private final CustomerRepository customerRepository;
	private final TokenService tokenService;
	private final OauthTokenService oauthTokenService;
	
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
	        
	        Duration TTL = Duration.ofMinutes(10);
	        String token = oauthTokenService.issue(provider, providerId, "choose", TTL);
	      	        
	        String redirect = frontendBaseUrl + "/oauth2/land#mode=choose&token=" +
	                URLEncoder.encode(token, StandardCharsets.UTF_8);
	        
	        res.sendRedirect(redirect);
        } catch (Exception e) {
            e.printStackTrace();
            res.sendRedirect(frontendBaseUrl + "/login?error=oauth2");
        }
    }
    
	private String extractProviderId(String provider, Map<String, Object> attrs) {
	    switch (provider) {
	        case "google":
	            return asString(attrs.getOrDefault("sub", attrs.get("id")));
	        case "kakao":
	            return asString(attrs.get("id"));
	        case "naver": {
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
