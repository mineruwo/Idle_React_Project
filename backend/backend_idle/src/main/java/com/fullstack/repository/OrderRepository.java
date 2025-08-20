// src/main/java/com/fullstack/repository/OrderRepository.java
package com.fullstack.repository;

import com.fullstack.entity.Order;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

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

    /** 기본 목록: 최신순 (서비스에서 Sort.by(DESC, "createdAt")로 대체 가능) */
    List<Order> findAllByOrderByCreatedAtDesc();

    /** 주문번호 중복 체크 (주문번호 자동발급 시 사용) */
    boolean existsByOrderNo(String orderNo);

    /**
     * ✅ 검색: 주문번호 + 출발/도착/상태/차량/화물/크기/포장 (최신순)
     *  - lower + coalesce 로 null-safe 부분일치
     *  - JPQL 은 엔티티 필드명(camelCase) 사용
     */
    @Query("""
        select o
          from Order o
         where lower(coalesce(o.orderNo, ''))         like lower(concat('%', :q, '%'))
            or lower(coalesce(o.departure, ''))       like lower(concat('%', :q, '%'))
            or lower(coalesce(o.arrival, ''))         like lower(concat('%', :q, '%'))
            or lower(coalesce(o.status, ''))          like lower(concat('%', :q, '%'))
            or lower(coalesce(o.vehicle, ''))         like lower(concat('%', :q, '%'))
            or lower(coalesce(o.cargoType, ''))       like lower(concat('%', :q, '%'))
            or lower(coalesce(o.cargoSize, ''))       like lower(concat('%', :q, '%'))
            or lower(coalesce(o.packingOption, ''))   like lower(concat('%', :q, '%'))
         order by o.createdAt desc
    """)
    List<Order> searchLatest(@Param("q") String q);

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
