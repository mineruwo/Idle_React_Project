package com.fullstack.service;

import java.util.Collection;
import java.util.Collections;
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

		Map<String, Object> attr = user.getAttributes();
		
        String provider = req.getClientRegistration().getRegistrationId(); // "google"
        String providerId = (String) attr.get("sub");
        String email = (String) attr.get("email");
        String name = (String) attr.get("name");
        Boolean emailVerified = (Boolean) attr.getOrDefault("email_verified", false);

        // 1) provider+providerId 로 기존 계정 찾기
        CustomerEntity existing = customerRepository.findBySnsLoginProviderAndSnsProviderId(provider, providerId)
                .orElse(null);

        // 2) 없으면 email 로 기존 로컬 계정/다른 SNS 계정과 연결 시도
        if (existing == null && email != null) {
            existing = customerRepository.findById(email).orElse(null);
            if (existing != null) {
                // 이미 로컬로 가입한 유저 → SNS 연동
                existing.setSnsLoginProvider(provider);
                existing.setSnsProviderId(providerId);
                customerRepository.save(existing);
            }
        }
        
        // 여기서 권한/Principal 구성
        Collection<? extends GrantedAuthority> authorities =
                (existing == null)
                ? Collections.<GrantedAuthority>emptyList()
                : Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + existing.getRole().toUpperCase()));
        
        String nameAttributeKey = req.getClientRegistration()
                .getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName();
        
        return new DefaultOAuth2User(authorities, attr, nameAttributeKey); 
    }

}
