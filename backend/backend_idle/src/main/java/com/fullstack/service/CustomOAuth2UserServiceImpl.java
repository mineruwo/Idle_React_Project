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

	    // 공급자별 attribute 평탄화 + nameAttributeKey 정리
        String nameAttributeKey = req.getClientRegistration()
                .getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName();

        if ("naver".equals(provider)) {
            Map<String, Object> response = asMap(attrs.get("response"));
            if (response != null) {
                attrs = new LinkedHashMap<>(response); 
            }
            nameAttributeKey = "id"; 
        } else if ("kakao".equals(provider)) {
            Map<String, Object> account = asMap(attrs.get("kakao_account"));
            if (account != null) {
                Object email = account.get("email");
                if (email != null) attrs.put("email", email);
                Map<String, Object> profile = asMap(account.get("profile"));
                if (profile != null) {
                    if (profile.get("nickname") != null) attrs.put("nickname", profile.get("nickname"));
                    if (profile.get("profile_image_url") != null) attrs.put("profile_image_url", profile.get("profile_image_url"));
                }
            }
            nameAttributeKey = "id"; 
        } else if ("google".equals(provider)) {
            nameAttributeKey = "sub";
        }
        
        String providerId = "google".equals(provider)
                ? asString(attrs.get("sub"))
                : asString(attrs.get("id")); 

        String resolvedEmail = asString(attrs.get("email")); 
        
        CustomerEntity linked = (providerId == null) ? null
                : customerRepository.findBySnsLoginProviderAndSnsProviderId(provider, providerId).orElse(null);

        CustomerEntity localByEmail = (resolvedEmail == null) ? null
                : customerRepository.findById(resolvedEmail).orElse(null);
        
        attrs.put("provider", provider);
        attrs.put("providerId", providerId);
        attrs.put("resolvedEmail", resolvedEmail);       
        attrs.put("existingLinkedUser", linked != null);
        attrs.put("emailUserExists", localByEmail != null);

        Collection<? extends GrantedAuthority> authorities =
                (linked == null)
                	? Collections.<GrantedAuthority>emptyList()
                	: Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + linked.getRole().toUpperCase()));
        
        if (!attrs.containsKey(nameAttributeKey)) {
            if (providerId != null) {
                attrs.put(nameAttributeKey, providerId);
            }
        }

        return new DefaultOAuth2User(authorities, attrs, nameAttributeKey); 
    }
	
    @SuppressWarnings("unchecked")
    private static Map<String, Object> asMap(Object o) {
        return (o instanceof Map) ? (Map<String, Object>) o : null;
    }
    private static String asString(Object o) {
        return (o == null) ? null : String.valueOf(o);
    }

}
