package com.fullstack.service;

import java.time.Duration;
import java.time.Instant;
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
		
		CustomerEntity customer = customerRepository.findById(id).orElseThrow();
		customer.setRefreshToken((HashUtils.sha256(refreshToken))); 
		customer.setRtExpiresAt(jwtUtil.getExpiration(refreshToken));
		customerRepository.save(customer);
		
		long atExpiresIn = 15 * 60;
		long rtExpiresIn = 14 * 24 * 60 * 60;
		
		return new TokenDTO(accessToken, refreshToken, atExpiresIn, rtExpiresIn);
		
	}
	
	@Override
	public TokenDTO refresh(String rawRt) {
	    String id = jwtUtil.getId(rawRt);

	    CustomerEntity customer = customerRepository.findById(id).orElseThrow();

	    boolean expired = customer.getRtExpiresAt().isBefore(Instant.now());
	    boolean mismatch = !Objects.equals(customer.getRefreshToken(), HashUtils.sha256(rawRt));
	    
	    if (expired || mismatch) {
	    	throw new RuntimeException("Refresh Token이 만료되었거나 일치하지 않습니다.");
        }

	    String newAt = jwtUtil.generateAccessToken(id, customer.getRole(), Duration.ofMinutes(15));
	    String newRt = jwtUtil.generateRefreshToken(id, Duration.ofDays(14));

	    customer.setRefreshToken(HashUtils.sha256(newRt));
	    customer.setRtExpiresAt(jwtUtil.getExpiration(newRt));
	    customerRepository.save(customer);
	    
	    long atExpiresIn = 15 * 60;
		long rtExpiresIn = 14 * 24 * 60 * 60;

	    return new TokenDTO(newAt, newRt, atExpiresIn, rtExpiresIn);
	}

}
