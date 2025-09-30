package com.fullstack.service;

import com.fullstack.model.AppSnsLoginRequestDTO;
import com.fullstack.model.LoginResponseDTO;

public interface AppSnsService {
	
	public LoginResponseDTO handleSnsLogin(AppSnsLoginRequestDTO request);
}
