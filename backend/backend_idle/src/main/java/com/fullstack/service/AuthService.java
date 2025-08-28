package com.fullstack.service;

import com.fullstack.model.CustomerDTO;
import com.fullstack.model.LoginRequestDTO;
import com.fullstack.model.LoginResponseDTO;
import com.fullstack.model.SignupRequestDTO;

public interface AuthService {

	public LoginResponseDTO authenticate(LoginRequestDTO loginRequestDTO);

	public void register(SignupRequestDTO signupRequestDTO);

	public boolean isIdDuplicate(String id);

	public boolean isNicknameDuplicate(String nickname);

}
