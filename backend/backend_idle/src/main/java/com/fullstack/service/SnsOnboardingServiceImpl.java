package com.fullstack.service;

import java.time.LocalDateTime;
import java.util.Locale;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.fullstack.entity.CustomerEntity;
import com.fullstack.model.SnsLinkExistingRequestDTO;
import com.fullstack.model.OauthLinkExistingDTO;
import com.fullstack.model.OauthSignupDTO;
import com.fullstack.model.OauthSignupRequestDTO;
import com.fullstack.model.OauthSignupTokenDTO;
import com.fullstack.model.SnsSignupRequestDTO;
import com.fullstack.repository.CustomerRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class SnsOnboardingServiceImpl implements SnsOnboardingService{

	private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public CustomerEntity completeSignup(OauthSignupDTO oauthSignupDTO, OauthSignupRequestDTO oauthSignupRequestDTO) {
        if (!"signup".equals(oauthSignupDTO.getMode()))
            throw new IllegalArgumentException("bad token mode");

        customerRepository.findBySnsLoginProviderAndSnsProviderId(
        		oauthSignupDTO.getProvider(), oauthSignupDTO.getProviderId()
        ).ifPresent(u -> { throw new IllegalStateException("already linked"); });

        String loginId = generateLoginId(oauthSignupDTO.getProvider(), oauthSignupDTO.getProviderId());

        CustomerEntity user = new CustomerEntity();
        user.setId(loginId);
        user.setPasswordEnc(null);        
        user.setCustomName(oauthSignupRequestDTO.getCustomName());    
        user.setNickname(oauthSignupRequestDTO.getNickname());          
        user.setSnsLoginProvider(oauthSignupDTO.getProvider());
        user.setSnsProviderId(oauthSignupDTO.getProviderId());
        user.setCreatedAt(LocalDateTime.now());
        user.setIsLefted(false);
        user.setUserPoint(0);
        user.setRole(oauthSignupRequestDTO.getRole());

        return customerRepository.save(user);
    }

    @Override
    public CustomerEntity linkExisting(OauthSignupDTO oauthSignupDTO, OauthLinkExistingDTO oauthLinkExistingDTO) {
        if (!"link".equals(oauthSignupDTO.getMode()))
            throw new IllegalArgumentException("bad ticket mode");

        customerRepository.findBySnsLoginProviderAndSnsProviderId(
        		oauthSignupDTO.getProvider(), oauthSignupDTO.getProviderId()
        ).ifPresent(u -> { throw new IllegalStateException("already linked"); });

        CustomerEntity existing = customerRepository.findById(oauthLinkExistingDTO.getId())
                .orElseThrow(() -> new IllegalArgumentException("user not found"));

        if (existing.getPasswordEnc() == null ||
            !passwordEncoder.matches(oauthLinkExistingDTO.getPasswordEnc(), existing.getPasswordEnc())) {
            throw new IllegalArgumentException("bad credentials");
        }

        existing.setSnsLoginProvider(oauthSignupDTO.getProvider());
        existing.setSnsProviderId(oauthSignupDTO.getProviderId());

        return customerRepository.save(existing);
    }

    // 간단 loginId 생성기 (중복 시 재시도)
    private String generateLoginId(String provider, String providerId) {
        String base = ("sns-" + provider + "-" + Math.abs(providerId.hashCode())).toLowerCase(Locale.ROOT);
        if (!customerRepository.existsById(base)) return base;
        for (int i = 0; i < 5; i++) {
            String cand = base + "-" + Integer.toHexString((int) (System.nanoTime() & 0xffff));
            if (!customerRepository.existsById(cand)) return cand;
        }
        return base + "-" + System.currentTimeMillis();
    }
}
