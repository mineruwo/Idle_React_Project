package com.fullstack.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fullstack.entity.PaymentEntity;

public interface PaymentRepository extends JpaRepository<PaymentEntity, String> {
	
	public long countByImpuidContainsIgnoreCase(String impuid);
	
}
