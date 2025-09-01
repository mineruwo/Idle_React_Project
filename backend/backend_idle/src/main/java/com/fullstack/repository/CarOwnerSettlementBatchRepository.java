package com.fullstack.repository;

import com.fullstack.entity.CarOwnerSettlementBatchEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

public interface CarOwnerSettlementBatchRepository extends JpaRepository<CarOwnerSettlementBatchEntity, Long>, JpaSpecificationExecutor<CarOwnerSettlementBatchEntity> {
	boolean existsByOwnerIdAndMonthKey(String ownerId, LocalDate monthKey);

	Optional<CarOwnerSettlementBatchEntity> findByOwnerIdAndMonthKey(String ownerId, LocalDate monthKey);

	Optional<CarOwnerSettlementBatchEntity> findTopByOwnerIdAndMonthKeyOrderByIdDesc(String ownerId, LocalDate monthKey);


	@Query("""
			  select coalesce(sum(b.totalAmount), 0)
			  from CarOwnerSettlementBatch b
			  where b.ownerId = :ownerId
			    and b.status in (
			      com.fullstack.entity.CarOwnerSettlementBatch$Status.REQUESTED,
			      com.fullstack.entity.CarOwnerSettlementBatch$Status.APPROVED
			    )
			""")
	BigDecimal sumUnsettled(@Param("ownerId") String ownerId);

	@Query("""
			  select coalesce(sum(b.totalAmount), 0)
			  from CarOwnerSettlementBatch b
			  where b.ownerId = :ownerId
			    and b.paidAt >= :start and b.paidAt < :end
			    and b.status = com.fullstack.entity.CarOwnerSettlementBatch$Status.PAID
			""")
	BigDecimal sumPaidBetween(@Param("ownerId") String ownerId, @Param("start") LocalDateTime start,
			@Param("end") LocalDateTime end);

	@Query("""
			  select coalesce(sum(b.totalAmount), 0)
			  from CarOwnerSettlementBatch b
			  where b.ownerId = :ownerId
			    and b.monthKey >= :monthStart and b.monthKey < :monthEnd
			    and b.status in (
			      com.fullstack.entity.CarOwnerSettlementBatch$Status.REQUESTED,
			      com.fullstack.entity.CarOwnerSettlementBatch$Status.APPROVED,
			      com.fullstack.entity.CarOwnerSettlementBatch$Status.PAID
			    )
			""")
	BigDecimal sumForMonth(@Param("ownerId") String ownerId, @Param("monthStart") LocalDate monthStart,
			@Param("monthEnd") LocalDate monthEnd);
}