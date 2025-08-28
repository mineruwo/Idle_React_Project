package com.fullstack.service;

import com.fullstack.entity.CustomerEntity;
import com.fullstack.model.CustomerDTO;

import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomerService {

	public Page<CustomerEntity> getCustomers(Pageable pageable, String role, String searchType, String searchQuery);

	public CustomerDTO createCustomer(CustomerDTO dto);
	
	public Integer getPoints(String id);

    public CustomerDTO getCustomerById(String id);
    public CustomerDTO updateCustomer(String id, CustomerDTO customerDTO);
    public void deleteCustomer(String id);

    Page<CustomerDTO> getRecentlyCreatedCustomers(Pageable pageable, String dateRange);
    Page<CustomerDTO> getRecentlyDeletedCustomers(Pageable pageable, String dateRange);

    Map<String, Long> getDailyCustomerCreationCounts(int year, int month);
    Map<String, Long> getDailyCustomerDeletionCounts(int year, int month);
}
