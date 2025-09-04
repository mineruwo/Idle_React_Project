package com.fullstack.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.fullstack.entity.CustomerEntity;
import com.fullstack.exception.PasswordUnchangedException;
import com.fullstack.model.ResetPasswordDTO;
import com.fullstack.model.ResetPasswordTicketDTO;
import com.fullstack.repository.CustomerRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ResetPasswordServiceImpl implements ResetPasswordService {

	private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final ResetTokenService resetTokenService;
	
	@Transactional
    public void resetPassword(ResetPasswordDTO resetPasswordDTO) {
		Optional<ResetPasswordTicketDTO> opt = resetTokenService.consume(resetPasswordDTO.getToken());
		if (opt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "유효하지 않은 토큰입니다.");
        }
		ResetPasswordTicketDTO ticket = opt.get();
		
		CustomerEntity customer = customerRepository.findById(ticket.getId())
		            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "유효하지 않은 사용자입니다."));
        
        if (passwordEncoder.matches(resetPasswordDTO.getNewPassword(), customer.getPasswordEnc())) {
        	throw new PasswordUnchangedException("새로운 비밀번호는 기존 비밀번호와 같을 수 없습니다.");
        }
        
        LocalDateTime now = LocalDateTime.now();
        
        customer.setPasswordEnc(passwordEncoder.encode(resetPasswordDTO.getNewPassword()));
        customer.setUpdatedAt(now);
        customer.setRefreshToken(null);
        customer.setRtExpiresAt(null);
    }

}
