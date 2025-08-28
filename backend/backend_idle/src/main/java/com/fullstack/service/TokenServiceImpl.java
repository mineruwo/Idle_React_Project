package com.fullstack.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Objects;

import org.springframework.stereotype.Service;

import com.fullstack.entity.CustomerEntity;
import com.fullstack.model.TokenDTO;
import com.fullstack.repository.CustomerRepository;
import com.fullstack.security.jwt.JWTUtil;
import com.fullstack.security.util.HashUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TokenServiceImpl implements TokenService {

	private final JWTUtil jwtUtil;
	private final CustomerRepository customerRepository;
	
	@Override
	public TokenDTO issue(String id, String role) {
		String accessToken = jwtUtil.generateAccessToken(id, role, Duration.ofMinutes(15));
		String refreshToken = jwtUtil.generateRefreshToken(id, Duration.ofDays(14));
		
		CustomerEntity customerEntity = customerRepository.findById(id).orElseThrow();
		customerEntity.setRefreshToken((HashUtils.sha256(refreshToken))); 
		customerEntity.setRtExpiresAt(jwtUtil.getExpiration(refreshToken));
		customerRepository.save(customerEntity);
		
		long atExpiresIn = 15 * 60;
		long rtExpiresIn = 14 * 24 * 60 * 60;
		
		return new TokenDTO(accessToken, refreshToken, atExpiresIn, rtExpiresIn);
		
	}
	
	@Override
	public TokenDTO refresh(String rawRt) {
	    String id = jwtUtil.getId(rawRt);

	    CustomerEntity customerEntity = customerRepository.findById(id).orElseThrow();

	    boolean expired = customerEntity.getRtExpiresAt().isBefore(LocalDateTime.now());
	    boolean mismatch = !Objects.equals(customerEntity.getRefreshToken(), HashUtils.sha256(rawRt));
	    
	    if (expired || mismatch) {
	    	throw new RuntimeException("Refresh Token이 만료되었거나 일치하지 않습니다.");
        }

	    String newAt = jwtUtil.generateAccessToken(id, customerEntity.getRole(), Duration.ofMinutes(15));
	    String newRt = jwtUtil.generateRefreshToken(id, Duration.ofDays(14));

	    customerEntity.setRefreshToken(HashUtils.sha256(newRt));
	    customerEntity.setRtExpiresAt(jwtUtil.getExpiration(newRt));
	    customerRepository.save(customerEntity);
	    
	    long atExpiresIn = 15 * 60;
		long rtExpiresIn = 14 * 24 * 60 * 60;

	    return new TokenDTO(newAt, newRt, atExpiresIn, rtExpiresIn);
	}

}
