package com.fullstack.service;

import java.util.List;
import java.util.Optional;

import com.fullstack.model.CustomerDTO;

public interface CustomerService {
	/*
	public List<CustomerDTO> getAllCustomers();

    public Optional<CustomerDTO> getCustomerByIdNum(Integer idNum);

    public CustomerDTO createCustomer(CustomerDTO customer);

    public CustomerDTO updateCustomer(Integer idNum, CustomerDTO customerDetails);

    public void deleteCustomer(Integer idNum);

    public CustomerDTO getCustomerById(String id);
    */
    public void register(CustomerDTO dto);
    
    boolean isIdDuplicate(String id);
    
    boolean isNicknameDuplicate(String id);
}
