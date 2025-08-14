package com.fullstack.service;

import com.fullstack.entity.CustomerEntity;
import com.fullstack.model.CustomerDTO;
import com.fullstack.model.LoginResponseDTO;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomerService {

	public LoginResponseDTO login(CustomerDTO dto);
	
	public void register(CustomerDTO dto);
    
	public boolean isAccountValid(String id, String passwordEnc);
    
	public boolean isIdDuplicate(String id);
    
	public boolean isNicknameDuplicate(String id);

	public Page<CustomerEntity> getCustomers(Pageable pageable);

	public CustomerDTO createCustomer(CustomerDTO dto);
	
	public Integer getPoints(String id);
}
