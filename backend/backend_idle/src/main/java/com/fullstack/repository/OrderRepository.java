// com.fullstack.repository.OrderRepository
package com.fullstack.repository;

import com.fullstack.entity.Order;

import java.time.LocalDateTime;
import java.util.List;

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

	// ✅ 추가: 상태별 카운트
	long countByAssignedDriverIdAndStatus(Long assignedDriverId, String status);

	// ✅ 추가: 진행중 최근 5건
	List<Order> findTop5ByAssignedDriverIdAndStatusOrderByUpdatedAtDesc(Long assignedDriverId, String status);

	// (선택) 일자별 운송건수 필요 시 JPQL/네이티브로 추가 가능
	@Query("""
			  select function('to_char', o.updatedAt, 'YYYY-MM-DD') as day, count(o.id)
			  from Order o
			  where o.assignedDriverId = :driverId and o.updatedAt between :start and :end
			  group by function('to_char', o.updatedAt, 'YYYY-MM-DD') order by day
			""")
	List<Object[]> countDailyByDriver(@Param("driverId") Long driverId, @Param("start") LocalDateTime start,
			@Param("end") LocalDateTime end);
}
