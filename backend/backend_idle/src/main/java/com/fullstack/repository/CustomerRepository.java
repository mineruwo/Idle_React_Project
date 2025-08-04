package com.fullstack.repository;

import com.fullstack.model.CustomerDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<CustomerDTO, Integer> {
    CustomerDTO findById(String id);
}
