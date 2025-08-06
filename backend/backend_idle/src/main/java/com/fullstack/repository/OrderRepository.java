package com.fullstack.repository;

import com.fullstack.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<Order, Long> {

	// carOwner
	@Query("SELECT COUNT(o) FROM Order o WHERE o.vehicle = :carNum AND o.status = :status")
	int countByCarNumAndStatus(@Param("carNum") String carNum, @Param("status") String status);

}