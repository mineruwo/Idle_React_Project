package com.fullstack.service;

import com.fullstack.entity.CustomerEntity;
import com.fullstack.model.CustomerDTO;
import com.fullstack.model.LoginResponseDTO;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomerService {

	public LoginResponseDTO login(CustomerDTO dto);
	
	public void register(CustomerDTO dto);
    
	public boolean isAccountValid(String id, String passwordEnc);
    
	public boolean isIdDuplicate(String id);
    
	public boolean isNicknameDuplicate(String id);

	public Page<CustomerEntity> getCustomers(Pageable pageable, String role, String searchType, String searchQuery);

	public CustomerDTO createCustomer(CustomerDTO dto);
	
	public Integer getPoints(String id);

    public CustomerEntity getCustomerById(Long id);


    Page<CustomerDTO> getRecentlyCreatedCustomers(Pageable pageable, String dateRange); // Modified
    Page<CustomerDTO> getRecentlyDeletedCustomers(Pageable pageable, String dateRange); // Modified

    Map<String, Long> getDailyCustomerCreationCounts(int year, int month);
    Map<String, Long> getDailyCustomerDeletionCounts(int year, int month); // New method // New method
}
