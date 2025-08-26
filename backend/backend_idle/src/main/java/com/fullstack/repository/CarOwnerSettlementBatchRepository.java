package com.fullstack.repository;


import java.time.LocalDate;
import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CarOwnerSettlementBatchRepository extends JpaRepository<CarOwnerSettlementBatchRepository, Long> {

    boolean existsByOwnerIdAndMonthKey(String ownerId, LocalDate monthKey);

    CarOwnerSettlementBatchRepository findByOwnerIdAndMonthKey(String ownerId, LocalDate monthKey);

    @Query("""
      select coalesce(sum(b.totalAmount),0)
      from SettlementBatch b
      where b.ownerId = :ownerId
        and b.status in ('REQUESTED','APPROVED')
    """)
    long sumUnsettled(@Param("ownerId") String ownerId);

    @Query("""
      select coalesce(sum(b.totalAmount),0)
      from SettlementBatch b
      where b.ownerId = :ownerId
        and b.paidAt >= :start and b.paidAt < :end
        and b.status = 'PAID'
    """)
    long sumPaidBetween(@Param("ownerId") String ownerId,
                        @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);

    @Query("""
      select coalesce(sum(b.totalAmount),0)
      from SettlementBatch b
      where b.ownerId = :ownerId
        and b.monthKey >= :monthStart and b.monthKey < :monthEnd
        and b.status in ('REQUESTED','APPROVED','PAID')
    """)
    long sumForMonth(@Param("ownerId") String ownerId,
                     @Param("monthStart") LocalDate monthStart,
                     @Param("monthEnd") LocalDate monthEnd);
}