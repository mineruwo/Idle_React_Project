package com.fullstack.service;

import com.fullstack.model.LoginRequestDTO;
import com.fullstack.model.LoginResponseDTO;

public interface AuthService {

	public LoginResponseDTO authenticate(LoginRequestDTO loginRequestDTO);
}
