package com.fullstack.service;

import com.fullstack.model.CustomerDTO;
import com.fullstack.model.LoginResponseDTO;

public interface CustomerService {

	public LoginResponseDTO login(CustomerDTO dto);
	
	public void register(CustomerDTO dto);
    
	public boolean isAccountValid(String id, String passwordEnc);
    
	public boolean isIdDuplicate(String id);
    
	public boolean isNicknameDuplicate(String id);
}
