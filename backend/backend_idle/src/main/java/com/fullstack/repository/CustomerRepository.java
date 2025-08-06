package com.fullstack.repository;

import com.fullstack.entity.CustomerEntity;
import com.fullstack.model.CustomerDTO;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<CustomerEntity, Integer> {
    
	Optional<CustomerEntity> findById(String id);
	
	Optional<CustomerEntity> findByNickname(String nickname);
	
	boolean existsById(String id);

    boolean existsByNickname(String nickname);
}
