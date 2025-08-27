package com.fullstack.service;

import java.time.LocalDateTime;
import java.util.Locale;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.fullstack.entity.CustomerEntity;
import com.fullstack.model.SnsLinkExistingRequestDTO;
import com.fullstack.model.SnsSignupDTO;
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
    public CustomerEntity completeSignup(SnsSignupDTO snsSignupDTO, SnsSignupRequestDTO snsSignupRequestDTO) {
        if (!"signup".equals(snsSignupDTO.getMode()))
            throw new IllegalArgumentException("bad ticket mode");

        customerRepository.findBySnsLoginProviderAndSnsProviderId(
                snsSignupDTO.getProvider(), snsSignupDTO.getProviderId()
        ).ifPresent(u -> { throw new IllegalStateException("already linked"); });

        String loginId = generateLoginId(snsSignupDTO.getProvider(), snsSignupDTO.getProviderId());

        CustomerEntity user = new CustomerEntity();
        user.setId(loginId);
        user.setPasswordEnc(null);        
        user.setCustomName(snsSignupRequestDTO.getCustomName());    
        user.setNickname(snsSignupRequestDTO.getNickname());          
        user.setSnsLoginProvider(snsSignupDTO.getProvider());
        user.setSnsProviderId(snsSignupDTO.getProviderId());
        user.setCreatedAt(LocalDateTime.now());
        user.setIsLefted(false);
        user.setUserPoint(0);
        user.setRole(snsSignupRequestDTO.getRole());

        return customerRepository.save(user);
    }

    @Override
    public CustomerEntity linkExisting(SnsSignupDTO snsSignupDTO, SnsLinkExistingRequestDTO snsLinkExistingRequestDTO) {
        if (!"link".equals(snsSignupDTO.getMode()))
            throw new IllegalArgumentException("bad ticket mode");

        customerRepository.findBySnsLoginProviderAndSnsProviderId(
                snsSignupDTO.getProvider(), snsSignupDTO.getProviderId()
        ).ifPresent(u -> { throw new IllegalStateException("already linked"); });

        CustomerEntity existing = customerRepository.findById(snsLinkExistingRequestDTO.getId())
                .orElseThrow(() -> new IllegalArgumentException("user not found"));

        if (existing.getPasswordEnc() == null ||
            !passwordEncoder.matches(snsLinkExistingRequestDTO.getPasswordEnc(), existing.getPasswordEnc())) {
            throw new IllegalArgumentException("bad credentials");
        }

        existing.setSnsLoginProvider(snsSignupDTO.getProvider());
        existing.setSnsProviderId(snsSignupDTO.getProviderId());

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
