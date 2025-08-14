package com.fullstack.repository;

import com.fullstack.entity.Order;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<Order, Long> {
	  // 기존 count 메서드는 그대로 두고,
    long countByVehicleAndStatus(String vehicle, String status);
    
	// carOwner
	@Query("SELECT COUNT(o) FROM Order o WHERE o.vehicle = :carNum AND o.status = :status")
	int countByCarNumAndStatus(@Param("carNum") String carNum, @Param("status") String status);
	


    // ✅ 최신순 조회
    List<Order> findAllByOrderByCreatedAtDesc();

}
