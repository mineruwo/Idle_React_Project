package com.fullstack.service;

import com.fullstack.entity.CustomerEntity;
import com.fullstack.model.CustomerDTO;
import com.fullstack.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CustomerServiceImpl implements CustomerService  {

    @Autowired
    private CustomerRepository customerRepository;

    /*
    public List<CustomerDTO> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Optional<CustomerDTO> getCustomerByIdNum(Integer idNum) {
        return customerRepository.findById(idNum);
    }

    public CustomerDTO createCustomer(CustomerDTO customer) {
        customer.setCreatedAt(LocalDateTime.now());
        customer.setIsLefted(false); // 기본값 설정
        customer.setUserPoint(0); // 기본값 설정
        return customerRepository.save(customer);
    }

    public CustomerDTO updateCustomer(Integer idNum, CustomerDTO customerDetails) {
        CustomerDTO customer = customerRepository.findById(idNum)
                .orElseThrow(() -> new RuntimeException("Customer not found for this id :: " + idNum));

        customer.setId(customerDetails.getId());
        customer.setPasswordEnc(customerDetails.getPasswordEnc());
        customer.setCustomName(customerDetails.getCustomName());
        customer.setRole(customerDetails.getRole());
        customer.setPhone(customerDetails.getPhone());
        customer.setNickname(customerDetails.getNickname());
        customer.setSnsLoginProvider(customerDetails.getSnsLoginProvider());
        customer.setSnsProviderId(customerDetails.getSnsProviderId());
        customer.setUpdatedAt(LocalDateTime.now()); // 업데이트 시간 설정

        return customerRepository.save(customer);
    }

    public void deleteCustomer(Integer idNum) {
        CustomerDTO customer = customerRepository.findById(idNum)
                .orElseThrow(() -> new RuntimeException("Customer not found for this id :: " + idNum));
        customerRepository.delete(customer);
    }


    public CustomerDTO getCustomerById(String id) {
        return customerRepository.findById(id);
    }
    */
    
    @Override
    public void register(CustomerDTO dto) {
        CustomerEntity entity = dtoToEntity(dto);
        customerRepository.save(entity);
    }
    
    private CustomerEntity dtoToEntity(CustomerDTO dto) {
    	return CustomerEntity.builder()
    	        .id(dto.getId())
    	        .passwordEnc(dto.getPasswordEnc())
    	        .customName(dto.getCustomName())
    	        .phone(dto.getPhone())
    	        .nickname(dto.getNickname())
    	        .role(dto.getRole())
    	        .createdAt(LocalDateTime.now())
    	        .isLefted(false)
    	        .userPoint(0)
    	        .build();
    }
    
}
