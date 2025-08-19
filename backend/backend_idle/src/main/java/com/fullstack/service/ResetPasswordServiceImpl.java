package com.fullstack.service;

import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.fullstack.entity.CustomerEntity;
import com.fullstack.model.ResetPasswordDTO;
import com.fullstack.repository.CustomerRepository;
import com.fullstack.security.util.HashUtils;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ResetPasswordServiceImpl implements ResetPasswordService {

	private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
	
	@Transactional
    public void resetPassword(ResetPasswordDTO resetPasswordDTO) {
        String hash = HashUtils.sha256(resetPasswordDTO.getToken());
        LocalDateTime now = LocalDateTime.now();

        int updated = customerRepository.markResetTokenUsed(hash, now);
        if (updated == 0) {
            throw new IllegalArgumentException("토큰이 만료되었거나 이미 사용되었습니다.");
        }

        CustomerEntity customer = customerRepository.findByResetTokenHash(hash)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 토큰입니다."));

        customer.setPasswordEnc(passwordEncoder.encode(resetPasswordDTO.getNewPassword()));
        customer.setUpdatedAt(now);

        customer.setResetTokenHash(null);
        customer.setResetExpiresAt(null);
        customer.setResetUsed(true);

        customer.setRefreshToken(null);
        customer.setRtExpiresAt(null);
    }

}
