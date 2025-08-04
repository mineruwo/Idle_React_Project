package com.fullstack.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fullstack.entity.PaymentEntity;

public interface PaymentRepository extends JpaRepository<PaymentEntity , Long> {
	
	public long countByImpUidContainsIgnoreCase(String impUid);
	
		Optional<PaymentEntity> findByMerchantUid(String merchantUid);
	    Optional<PaymentEntity> findByImpUid(String impUid);
	
}
