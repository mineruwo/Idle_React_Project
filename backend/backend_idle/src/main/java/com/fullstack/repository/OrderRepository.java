// src/main/java/com/fullstack/repository/OrderRepository.java
package com.fullstack.repository;

import com.fullstack.entity.Order;
import com.fullstack.model.enums.OrderStatus; // Added import

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    	     where lower(coalesce(o.orderNo, ''))       like lower(concat('%', :q, '%'))
    	        or lower(coalesce(o.departure, ''))     like lower(concat('%', :q, '%'))
    	        or lower(coalesce(o.arrival, ''))       like lower(concat('%', :q, '%'))
    	        or lower(cast(o.status as string))      like lower(concat('%', :q, '%'))
    	        or lower(coalesce(o.vehicle, ''))       like lower(concat('%', :q, '%'))
    	        or lower(coalesce(o.cargoType, ''))     like lower(concat('%', :q, '%'))
    	        or lower(coalesce(o.cargoSize, ''))     like lower(concat('%', :q, '%'))
    	        or lower(coalesce(o.packingOption, '')) like lower(concat('%', :q, '%'))
    	     order by o.createdAt desc
    	""")
    	List<Order> searchLatest(@Param("q") String q);

	// ✅ 추가: 상태별 카운트
	long countByAssignedDriverIdAndStatus(Long assignedDriverId, OrderStatus status);

	// ✅ 추가: 진행중 최근 5건
	List<Order> findTop5ByAssignedDriverIdAndStatusInOrderByUpdatedAtDesc(
	        Long assignedDriverId, OrderStatus... statuses);
	
	 /** ✅ 로그인한 기사(driverId)에게 배정된 주문만 상태 변경 허용 */
    Optional<Order> findByIdAndAssignedDriverId(Long id, Long assignedDriverId);
    
    @Query("""
    	    select o from Order o
    	    where o.assignedDriverId = :driverId
    	      and (:status is null or o.status = :status)
    	      and o.updatedAt between :start and :end
    	      and (
    	           :q is null or :q = '' or
    	           lower(o.departure) like lower(concat('%', :q, '%')) or
    	           lower(o.arrival)   like lower(concat('%', :q, '%')) or
    	           lower(o.cargoType) like lower(concat('%', :q, '%'))
    	      )
    	""")
    	Page<Order> searchForDriver(
    	        @Param("driverId") Long driverId,
    	        @Param("status") OrderStatus status,  // ✅ enum
    	        @Param("start") LocalDateTime start,
    	        @Param("end") LocalDateTime end,
    	        @Param("q") String q,
    	        Pageable pageable
    	);
    /** ✅ 기사 월 매출 합계 (driverPrice 없으면 proposedPrice 사용) */
    @Query("""
    	    select coalesce(sum(coalesce(o.driverPrice, cast(o.proposedPrice as long))), 0)
    	    from Order o
    	    where o.assignedDriverId = :driverId
    	      and o.status = com.fullstack.model.enums.OrderStatus.COMPLETED
    	      and o.updatedAt between :start and :end
    	""")
    	Long sumMonthlyRevenueByDriver(
    	        @Param("driverId") Long driverId,
    	        @Param("start") LocalDateTime start,
    	        @Param("end") LocalDateTime end);

    	// ✅ 동일 패턴으로 두 메서드 모두 수정
    	@Query("""
    	    select function('to_char', o.updatedAt, 'YYYY-MM-DD') as day,
    	           coalesce(sum(coalesce(o.driverPrice, cast(o.proposedPrice as long))), 0) as sum
    	    from Order o
    	    where o.assignedDriverId = :driverId
    	      and o.status = com.fullstack.model.enums.OrderStatus.COMPLETED
    	      and o.updatedAt between :start and :end
    	    group by function('to_char', o.updatedAt, 'YYYY-MM-DD')
    	    order by day
    	""")
    	List<Object[]> sumDailyRevenueByDriver(
    	        @Param("driverId") Long driverId,
    	        @Param("start") LocalDateTime start,
    	        @Param("end") LocalDateTime end);

    	@Query("""
    	select coalesce(sum( case when o.driverPrice is not null then o.driverPrice 
    	                          else cast(o.proposedPrice as long) end ), 0)
    	from Order o
    	where o.assignedDriverId = :driverId
    	  and o.status = com.fullstack.model.enums.OrderStatus.COMPLETED
    	  and o.updatedAt between :start and :end
    	""")
    	Long sumRevenueByDriverBetween(@Param("driverId") Long driverId,
    	                               @Param("start") LocalDateTime start,
    	                               @Param("end") LocalDateTime end);

    	@Query("""
    	select function('to_char', o.updatedAt, 'YYYY-MM-DD') as day,
    	       coalesce(sum( case when o.driverPrice is not null then o.driverPrice 
    	                          else cast(o.proposedPrice as long) end ), 0) as sum
    	from Order o
    	where o.assignedDriverId = :driverId
    	  and o.status = com.fullstack.model.enums.OrderStatus.COMPLETED
    	  and o.updatedAt between :start and :end
    	group by function('to_char', o.updatedAt, 'YYYY-MM-DD')
    	order by day
    	""")
    	List<Object[]> sumDailyRevenueByDriverBetween(@Param("driverId") Long driverId,
    	                                              @Param("start") LocalDateTime start,
    	                                              @Param("end") LocalDateTime end);
    

	
    	@Query("""
    		    select function('to_char', o.updatedAt, 'YYYY-MM-DD') as day,
    		           count(o.id)
    		    from Order o
    		    where o.assignedDriverId = :driverId
    		      and o.status = 'COMPLETED'
    		      and o.updatedAt between :start and :end
    		    group by function('to_char', o.updatedAt, 'YYYY-MM-DD')
    		    order by day
    		""")
    		List<Object[]> countDailyCompletedByDriverBetween(
    		        @Param("driverId") Long driverId,
    		        @Param("start") LocalDateTime start,
    		        @Param("end") LocalDateTime end);

    List<Order> findByShipperIdOrderByCreatedAtDesc(String shipperId);

    long countByAssignedDriverIdAndStatusIn(Long assignedDriverId, Collection<OrderStatus> statuses); // or varargs
    long countByStatus(OrderStatus status);
    long countByStatusIn(Collection<OrderStatus> statuses);
    
   //차주 정산 
    List<Order> findByAssignedDriverIdAndStatusAndCreatedAtBetween(
            Long assignedDriverId, OrderStatus status, LocalDateTime start, LocalDateTime end);

    List<Order> findByStatusAndCreatedAtBetween(
            OrderStatus status, LocalDateTime start, LocalDateTime end);
}
