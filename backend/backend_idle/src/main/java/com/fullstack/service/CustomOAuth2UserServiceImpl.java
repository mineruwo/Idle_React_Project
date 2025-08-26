package com.fullstack.service;

import java.util.Collection;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.fullstack.entity.CustomerEntity;
import com.fullstack.repository.CustomerRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service("customOAuth2UserService")
@RequiredArgsConstructor
@Transactional
public class CustomOAuth2UserServiceImpl implements CustomOAuth2UserService {

	private final CustomerRepository customerRepository;
	
	@Override
    public OAuth2User loadUser(OAuth2UserRequest req) throws OAuth2AuthenticationException {
		DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();
		OAuth2User user = delegate.loadUser(req);
		
        String provider = req.getClientRegistration().getRegistrationId();
		Map<String, Object> attrs = new LinkedHashMap<>(user.getAttributes());
        
		String providerId = extractProviderId(provider, attrs);
	    String email = extractEmail(provider, attrs);

        CustomerEntity linked = (providerId == null) ? null
                : customerRepository.findBySnsLoginProviderAndSnsProviderId(provider, providerId).orElse(null);

        CustomerEntity localByEmail = (email == null) ? null
                : customerRepository.findById(email).orElse(null);
        
        attrs.put("provider", provider);
        attrs.put("providerId", providerId);
        attrs.put("resolvedEmail", email);       
        attrs.put("existingLinkedUser", linked != null);
        attrs.put("emailUserExists", localByEmail != null);

        Collection<? extends GrantedAuthority> authorities =
                (linked == null)
                	? Collections.<GrantedAuthority>emptyList()
                	: Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + linked.getRole().toUpperCase()));
        
        String nameAttributeKey = req.getClientRegistration()
                .getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName();
        
        return new DefaultOAuth2User(authorities, attrs, nameAttributeKey); 
    }
	
	private String extractProviderId(String provider, Map<String, Object> attrs) {
        switch (provider) {
            case "google":
                return (String) attrs.get("sub");
            case "kakao": {
                Object id = attrs.get("id");
                return (id != null) ? String.valueOf(id) : null;
            }
            case "naver": {
                Map<?, ?> resp = (Map<?, ?>) attrs.get("response");
                return (resp != null) ? (String) resp.get("id") : null;
            }
            default:
                return null;
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

}
