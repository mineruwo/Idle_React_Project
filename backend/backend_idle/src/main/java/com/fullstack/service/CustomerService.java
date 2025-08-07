package com.fullstack.service;

import java.util.List;
import java.util.Optional;

import com.fullstack.model.CustomerDTO;
import com.fullstack.model.LoginResponseDTO;

public interface CustomerService {
	/*
	public List<CustomerDTO> getAllCustomers();

    public Optional<CustomerDTO> getCustomerByIdNum(Integer idNum);

    public CustomerDTO createCustomer(CustomerDTO customer);

    public CustomerDTO updateCustomer(Integer idNum, CustomerDTO customerDetails);

    public void deleteCustomer(Integer idNum);

    public CustomerDTO getCustomerById(String id);
    */
	public LoginResponseDTO login(CustomerDTO dto);
	
	public void register(CustomerDTO dto);
    
	public boolean isAccountValid(String id, String passwordEnc);
    
	public boolean isIdDuplicate(String id);
    
	public boolean isNicknameDuplicate(String id);
}
