package com.fullstack.service;

import com.fullstack.model.Customer;
import com.fullstack.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Optional<Customer> getCustomerByIdNum(Integer idNum) {
        return customerRepository.findById(idNum);
    }

    public Customer createCustomer(Customer customer) {
        customer.setCreatedAt(LocalDateTime.now());
        customer.setIsLefted(false); // 기본값 설정
        customer.setUserPoint(0); // 기본값 설정
        return customerRepository.save(customer);
    }

    public Customer updateCustomer(Integer idNum, Customer customerDetails) {
        Customer customer = customerRepository.findById(idNum)
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
        Customer customer = customerRepository.findById(idNum)
                .orElseThrow(() -> new RuntimeException("Customer not found for this id :: " + idNum));
        customerRepository.delete(customer);
    }

    public Customer getCustomerById(String id) {
        return customerRepository.findById(id);
    }
}
