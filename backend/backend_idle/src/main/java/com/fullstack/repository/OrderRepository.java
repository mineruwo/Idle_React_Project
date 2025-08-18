// com.fullstack.repository.OrderRepository
package com.fullstack.repository;

import com.fullstack.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<Order, Long> {

    /** 배정된 기사 ID만 조회 (null 가능) */
    @Query("select o.assignedDriverId from Order o where o.id = :orderId")
    Integer findAssignedDriverIdOnly(@Param("orderId") Long orderId);

    /** 확정 운임만 조회 (null 가능) */
    @Query("select o.driverPrice from Order o where o.id = :orderId")
    Long findDriverPriceOnly(@Param("orderId") Long orderId);

    /** 상태만 조회 */
    @Query("select o.status from Order o where o.id = :orderId")
    String findStatusOnly(@Param("orderId") Long orderId);
}
