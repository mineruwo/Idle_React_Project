package com.fullstack.service;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.fullstack.entity.CustomerEntity;
import com.fullstack.exception.PasswordUnchangedException;
import com.fullstack.model.ResetPasswordDTO;
import com.fullstack.repository.CustomerRepository;
import com.fullstack.security.util.HashUtils;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@RequiredArgsConstructor
public class ResetPasswordServiceImpl implements ResetPasswordService {

	private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
	
	@Transactional
    public void resetPassword(ResetPasswordDTO resetPasswordDTO) {
        String hash = HashUtils.sha256(resetPasswordDTO.getToken());
        LocalDateTime now = LocalDateTime.now();
        
        CustomerEntity customer = customerRepository.findByResetTokenHash(hash)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "유효하지 않은 토큰입니다."));

        if (Boolean.TRUE.equals(customer.getResetUsed()) ||
                customer.getResetExpiresAt() == null ||
                !customer.getResetExpiresAt().isAfter(now)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "토큰이 만료되었거나 이미 사용되었습니다.");
            }
        
        if (passwordEncoder.matches(resetPasswordDTO.getNewPassword(), customer.getPasswordEnc())) {
        	throw new PasswordUnchangedException("새로운 비밀번호는 기존 비밀번호와 같을 수 없습니다.");
        }
        
        customer.setPasswordEnc(passwordEncoder.encode(resetPasswordDTO.getNewPassword()));
        customer.setUpdatedAt(now);

        customer.setResetTokenHash(null);
        customer.setResetExpiresAt(null);
        customer.setResetUsed(true);

        customer.setRefreshToken(null);
        customer.setRtExpiresAt(null);
    }

}
