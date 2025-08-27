package com.fullstack.repository;

import com.fullstack.entity.CarOwnerSettlement;
import com.fullstack.entity.CarOwnerSettlement.Status;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CarOwnerSettlementRepository extends JpaRepository<CarOwnerSettlement, Long> {

	Page<CarOwnerSettlement> findByOwnerIdAndCreatedAtBetween(
            String ownerId, LocalDateTime start, LocalDateTime end, Pageable pageable);

    Page<CarOwnerSettlement> findByOwnerIdAndStatusAndCreatedAtBetween(
            String ownerId, Status status, LocalDateTime start, LocalDateTime end, Pageable pageable);

    boolean existsByOrderId(Long orderId);

    @Query("select s.id from CarOwnerSettlement s where s.order.id = :orderId")
    Optional<Long> findIdByOrderId(@Param("orderId") Long orderId);
    @Query("""
      select s
      from CarOwnerSettlement s
      join s.batch b
      where b.ownerId = :ownerId
        and (:status is null or b.status = :status)
        and (:fromMonth is null or b.monthKey >= :fromMonth)
        and (:toNextMonth   is null or b.monthKey <  :toNextMonth)
      order by b.monthKey desc, s.id desc
    """)
    Page<CarOwnerSettlement> search(
            @Param("ownerId") String ownerId,
            @Param("status") String status,      // REQUESTED/APPROVED/PAID/CANCELED or null
            @Param("fromMonth") LocalDate fromMonthFirst, // yyyy-MM-01
            @Param("toNextMonth") LocalDate toMonthNextFirst, // (to 월의 다음달 1일)
            Pageable pageable
    );

    // ==== 기간 합계(기존 summaryCard용) ====
    @Query("select coalesce(sum(s.amount), 0) from CarOwnerSettlement s " +
           "where s.ownerId = :ownerId and s.createdAt between :start and :end")
    BigDecimal sumAmountByOwnerAndCreatedAtBetween(@Param("ownerId") String ownerId,
                                                   @Param("start") LocalDateTime start,
                                                   @Param("end") LocalDateTime end);

    @Query("select coalesce(sum(s.commission), 0) from CarOwnerSettlement s " +
           "where s.ownerId = :ownerId and s.createdAt between :start and :end")
    BigDecimal sumCommissionByOwnerAndCreatedAtBetween(@Param("ownerId") String ownerId,
                                                       @Param("start") LocalDateTime start,
                                                       @Param("end") LocalDateTime end);

    long countByOwnerIdAndStatusAndCreatedAtBetween(String ownerId, Status status,
                                                    LocalDateTime start, LocalDateTime end);

    // ==== 배치(월) 기준 합계/건수 ====
    @Query("select coalesce(sum(s.amount), 0) from CarOwnerSettlement s " +
           "where s.ownerId = :ownerId and s.monthKey = :monthKey")
    BigDecimal sumAmountByOwnerAndMonthKey(@Param("ownerId") String ownerId,
                                           @Param("monthKey") LocalDate monthKey);

    @Query("select coalesce(sum(s.commission), 0) from CarOwnerSettlement s " +
           "where s.ownerId = :ownerId and s.monthKey = :monthKey")
    BigDecimal sumCommissionByOwnerAndMonthKey(@Param("ownerId") String ownerId,
                                               @Param("monthKey") LocalDate monthKey);

    long countByOwnerIdAndMonthKey(String ownerId, LocalDate monthKey);
    
    @Modifying
    @Query("""
    update CarOwnerSettlement s
    set s.status = com.fullstack.entity.CarOwnerSettlement.Status.REQUESTED,
        s.requestedAt = CURRENT_TIMESTAMP,
        s.updatedAt = CURRENT_TIMESTAMP
    where s.ownerId = :ownerId and s.monthKey = :monthKey
      and s.status = com.fullstack.entity.CarOwnerSettlement.Status.READY
    """)
    int bulkMarkRequested(@Param("ownerId") String ownerId, @Param("monthKey") LocalDate monthKey);
}