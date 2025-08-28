package com.fullstack.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fullstack.entity.Order;
import com.fullstack.entity.PaymentEntity;

public interface PaymentRepository extends JpaRepository<PaymentEntity, Long> {

	public long countByImpUidContainsIgnoreCase(String impUid);

	Optional<PaymentEntity> findByMerchantUid(String merchantUid);

	Optional<PaymentEntity> findByImpUid(String impUid);

	// findByOrder 대신 새로운 메소드 추가
	Optional<PaymentEntity> findTopByOrderAndPaymentStatusOrderByPaidAtDesc(Order order, String paymentStatus);
	
}
