package com.fullstack.repository;

import com.fullstack.entity.OrderEntity;
import com.fullstack.model.enums.OrderStatus;
import com.fullstack.entity.CustomerEntity; // Added

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<OrderEntity, Long> {

    /* ---- 단건 필드 조회 (기존) ---- */
    @Query("select o.assignedDriver.idNum from OrderEntity o where o.id = :orderId")
    Integer findAssignedDriverIdOnly(@Param("orderId") Long orderId);

    @Query("select o.driverPrice from OrderEntity o where o.id = :orderId")
    Long findDriverPriceOnly(@Param("orderId") Long orderId);

    @Query("select o.status from OrderEntity o where o.id = :orderId")
    OrderStatus findStatusOnly(@Param("orderId") Long orderId);

    /* ---- 목록/검색 (기존) ---- */
    List<OrderEntity> findAllByOrderByCreatedAtDesc();
    boolean existsByOrderNo(String orderNo);
    
    // orderNo로 Order를 찾는 메소드 추가
    Optional<OrderEntity> findByOrderNo(String orderNo);

    @Query("""
    	    select o
    	      from OrderEntity o
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
    	List<OrderEntity> searchLatest(@Param("q") String q);

	// ✅ 추가: 상태별 카운트
	long countByAssignedDriverAndStatus(CustomerEntity assignedDriver, OrderStatus status);

	// ✅ 추가: 진행중 최근 5건
	List<OrderEntity> findTop5ByAssignedDriverAndStatusInOrderByUpdatedAtDesc(
	        CustomerEntity assignedDriver, OrderStatus... statuses);
	
	 /** ✅ 로그인한 기사(driverId)에게 배정된 주문만 상태 변경 허용 */
    Optional<OrderEntity> findByIdAndAssignedDriver(Long id, CustomerEntity assignedDriver);
    
    //오더 상태값 변경에 따른 시간 업데이트
    @Modifying
    @Query("""
        update OrderEntity o
           set o.status = com.fullstack.model.enums.OrderStatus.ONGOING,
               o.departedAt = :now,
               o.updatedAt  = :now
         where o.id = :orderId
           and o.assignedDriver.idNum = :driverId
    """)
    int markDeparted(@Param("orderId") Long orderId,
                     @Param("driverId") Long driverId,
                     @Param("now") LocalDateTime now);

    @Modifying
    @Query("""
        update OrderEntity o
           set o.status = com.fullstack.model.enums.OrderStatus.COMPLETED,
               o.completedAt = :now,
               o.updatedAt   = :now
         where o.id = :orderId
           and o.assignedDriver.idNum = :driverId
           and o.status = com.fullstack.model.enums.OrderStatus.ONGOING
    """)
    int markCompleted(@Param("orderId") Long orderId,
                      @Param("driverId") Long driverId,
                      @Param("now") LocalDateTime now);
    
    @Modifying
    @Query("""
        update OrderEntity o
           set o.status = com.fullstack.model.enums.OrderStatus.CANCELED,
               o.updatedAt = :now
         where o.id = :orderId
           and o.assignedDriver.idNum = :driverId
           and o.status in (
                com.fullstack.model.enums.OrderStatus.READY,
                com.fullstack.model.enums.OrderStatus.ONGOING
           )
    """)
    int markCanceled(@Param("orderId") Long orderId,
                     @Param("driverId") Long driverId,
                     @Param("now") LocalDateTime now);
   //---------------------------------------------------------------
    
    @Query("""
    	    select o from OrderEntity o
    	    where o.assignedDriver.idNum = :driverId
    	      and (:status is null or o.status = :status)
    	      and o.updatedAt between :start and :end
    	      and (
    	           :q is null or :q = '' or
    	           lower(o.departure) like lower(concat('%', :q, '%')) or
    	           lower(o.arrival)   like lower(concat('%', :q, '%')) or
    	           lower(o.cargoType) like lower(concat('%', :q, '%'))
    	      )
    	""")
    	Page<OrderEntity> searchForDriver(
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
    	    from OrderEntity o
    	    where o.assignedDriver.idNum = :driverId
    	      and o.status = com.fullstack.model.enums.OrderStatus.COMPLETED
    	      and o.updatedAt between :start and :end
    	""")
    	Long sumMonthlyRevenueByDriver(
    	        @Param("driverId") Long driverId,
    	        @Param("start") LocalDateTime start,
    	        @Param("end") LocalDateTime end);

    	
    	@Query("""
    	    select function('to_char', o.updatedAt, 'YYYY-MM-DD') as day,
    	           coalesce(sum(coalesce(o.driverPrice, cast(o.proposedPrice as long))), 0) as sum
    	    from OrderEntity o
    	    where o.assignedDriver.idNum = :driverId
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
    	from OrderEntity o
    	where o.assignedDriver.idNum = :driverId
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
    	from OrderEntity o
    	where o.assignedDriver.idNum = :driverId
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
    		    from OrderEntity o
    		    where o.assignedDriver.idNum = :driverId
    		      and o.status = 'COMPLETED'
    		      and o.updatedAt between :start and :end
    		    group by function('to_char', o.updatedAt, 'YYYY-MM-DD')
    		    order by day
    		""")
    		List<Object[]> countDailyCompletedByDriverBetween(
    		        @Param("driverId") Long driverId,
    		        @Param("start") LocalDateTime start,
    		        @Param("end") LocalDateTime end);

    List<OrderEntity> findByShipperOrderByCreatedAtDesc(CustomerEntity shipper);

    long countByAssignedDriverAndStatusIn(CustomerEntity assignedDriver, Collection<OrderStatus> statuses); // or varargs
    long countByStatus(OrderStatus status);
    long countByStatusIn(Collection<OrderStatus> statuses);
    
   //차주 정산 
    List<OrderEntity> findByAssignedDriverAndStatusAndCreatedAtBetween(
            CustomerEntity assignedDriver, OrderStatus status, LocalDateTime start, LocalDateTime end);

    List<OrderEntity> findByStatusAndCreatedAtBetween(
            OrderStatus status, LocalDateTime start, LocalDateTime end);

    List<OrderEntity> findByCreatedAtBetween(LocalDateTime startDateTime, LocalDateTime endDateTime);
}