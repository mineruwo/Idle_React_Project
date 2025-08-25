// src/main/java/com/fullstack/repository/OrderRepository.java
package com.fullstack.repository;

import com.fullstack.entity.Order;
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
    String findStatusOnly(@Param("orderId") Long orderId);

    /* ---- 목록/검색 (기존) ---- */
    List<Order> findAllByOrderByCreatedAtDesc();
    boolean existsByOrderNo(String orderNo);

    @Query("""
        select o
          from Order o
         where lower(coalesce(o.orderNo, ''))       like lower(concat('%', :q, '%'))
            or lower(coalesce(o.departure, ''))     like lower(concat('%', :q, '%'))
            or lower(coalesce(o.arrival, ''))       like lower(concat('%', :q, '%'))
            or lower(coalesce(o.status, ''))        like lower(concat('%', :q, '%'))
            or lower(coalesce(o.vehicle, ''))       like lower(concat('%', :q, '%'))
            or lower(coalesce(o.cargoType, ''))     like lower(concat('%', :q, '%'))
            or lower(coalesce(o.cargoSize, ''))     like lower(concat('%', :q, '%'))
            or lower(coalesce(o.packingOption, '')) like lower(concat('%', :q, '%'))
         order by o.createdAt desc
    """)
    List<Order> searchLatest(@Param("q") String q);

    /* ================== ✅ 대시보드/기사화면 집계용 ================== */

    /** 기사 + 상태별 건수 */
    long countByAssignedDriverIdAndStatus(Long assignedDriverId, String status);

    /** 기사 + 여러 상태의 합산 건수 (원하면 사용) */
    long countByAssignedDriverIdAndStatusIn(Long assignedDriverId, Collection<String> statuses);

    /** 최신 작업 5건: 기사 + 상태 기준, updatedAt desc */
    List<Order> findTop5ByAssignedDriverIdAndStatusOrderByUpdatedAtDesc(Long assignedDriverId, String status);

    /** 상태별 전체 건수 (원하면 사용) */
    long countByStatus(String status);

    /** 여러 상태 합산 전체 건수 (원하면 사용) */
    long countByStatusIn(Collection<String> statuses);
}
