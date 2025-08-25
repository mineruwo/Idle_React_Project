// src/main/java/com/fullstack/repository/OrderRepository.java
package com.fullstack.repository;

import com.fullstack.entity.Order;
import com.fullstack.model.enums.OrderStatus; // Added import

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    /* ---- 단건 필드 조회 (기존) ---- */
    @Query("select o.assignedDriverId from Order o where o.id = :orderId")
    Integer findAssignedDriverIdOnly(@Param("orderId") Long orderId);

    @Query("select o.driverPrice from Order o where o.id = :orderId")
    Long findDriverPriceOnly(@Param("orderId") Long orderId);

    @Query("select o.status from Order o where o.id = :orderId")
    OrderStatus findStatusOnly(@Param("orderId") Long orderId);

    /* ---- 목록/검색 (기존) ---- */
    List<Order> findAllByOrderByCreatedAtDesc();
    boolean existsByOrderNo(String orderNo);

    @Query("""
        select o
          from Order o
         where lower(coalesce(o.orderNo, ''))         like lower(concat('%', :q, '%'))
            or lower(coalesce(o.departure, ''))       like lower(concat('%', :q, '%'))
            or lower(coalesce(o.arrival, ''))         like lower(concat('%', :q, '%'))
            or lower(o.status)          like lower(concat('%', :q, '%'))
            or lower(coalesce(o.vehicle, ''))         like lower(concat('%', :q, '%'))
            or lower(coalesce(o.cargoType, ''))       like lower(concat('%', :q, '%'))
            or lower(coalesce(o.cargoSize, ''))       like lower(concat('%', :q, '%'))
            or lower(coalesce(o.packingOption, ''))   like lower(concat('%', :q, '%'))
         order by o.createdAt desc
    """)
    List<Order> searchLatest(@Param("q") String q);

	// ✅ 추가: 상태별 카운트
	long countByAssignedDriverIdAndStatus(Long assignedDriverId, OrderStatus status);

	// ✅ 추가: 진행중 최근 5건
	List<Order> findTop5ByAssignedDriverIdAndStatusOrderByUpdatedAtDesc(Long assignedDriverId, OrderStatus status);

	// (선택) 일자별 운송건수 필요 시 JPQL/네이티브로 추가 가능
	@Query("""
			  select function('to_char', o.updatedAt, 'YYYY-MM-DD') as day, count(o.id)
			  from Order o
			  where o.assignedDriverId = :driverId and o.updatedAt between :start and :end
			  group by function('to_char', o.updatedAt, 'YYYY-MM-DD') order by day
			""")
	List<Object[]> countDailyByDriver(@Param("driverId") Long driverId, @Param("start") LocalDateTime start,
			@Param("end") LocalDateTime end);

    List<Order> findByShipperIdOrderByCreatedAtDesc(String shipperId);

        /** 기사 + 여러 상태의 합산 건수 (원하면 사용) */
    long countByAssignedDriverIdAndStatusIn(Long assignedDriverId, Collection<String> statuses);

    /** 상태별 전체 건수 (원하면 사용) */
    long countByStatus(String status);

    /** 여러 상태 합산 전체 건수 (원하면 사용) */
    long countByStatusIn(Collection<String> statuses);
}
