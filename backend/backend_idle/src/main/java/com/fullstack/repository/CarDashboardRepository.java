package com.fullstack.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fullstack.entity.Order;
import com.fullstack.model.DashboardDTO;


public interface CarDashboardRepository extends JpaRepository<Order, Long> {
	@Query("SELECT new com.example.dto.DashboardDTO(" +
		       "SUM(CASE WHEN o.status = '완료' THEN 1 ELSE 0 END), " +
		       "SUM(CASE WHEN o.status = '배송중' THEN 1 ELSE 0 END), " +
		       "SUM(CASE WHEN o.status = '배송 예정' THEN 1 ELSE 0 END), " +
		       "COUNT(o), " +
		       "SUM(p.proposedPrice), " +
		       "AVG(p.commissionRate)) " + 
		       "FROM Order o JOIN OrderProp p ON o.orderId = p.orderId")
		DashboardDTO getDashboardData();
}
 