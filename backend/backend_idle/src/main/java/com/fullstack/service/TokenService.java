package com.fullstack.service;

import com.fullstack.model.TokenDTO;

public interface TokenService {
	
	public TokenDTO issue(String id, String role);
	
	public TokenDTO refresh(String refreshToken);
	
}
