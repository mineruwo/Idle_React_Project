package com.fullstack.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fullstack.entity.PaymentEntity;

public interface PaymentRepository extends JpaRepository<PaymentEntity, Long> {

	public long countByImpUidContainsIgnoreCase(String impUid);

	Optional<PaymentEntity> findByMerchantUid(String merchantUid);

	Optional<PaymentEntity> findByImpUid(String impUid);

	// carowner page
	@Query("SELECT COALESCE(SUM(p.amount), 0) FROM PaymentEntity p WHERE p.transportAuth.carNum = :carNum  AND FUNCTION('MONTH', p.paidAt) = FUNCTION('MONTH', CURRENT_DATE)")
	        		
	        long getRevenueThisMonth(@Param("carNum") String carNum);
}
