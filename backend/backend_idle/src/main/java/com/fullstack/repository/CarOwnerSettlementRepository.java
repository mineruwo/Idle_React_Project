package com.fullstack.repository;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import com.fullstack.entity.CarOwnerSettlement;
import com.fullstack.entity.CarOwnerSettlement.Status;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CarOwnerSettlementRepository extends JpaRepository<CarOwnerSettlement, Long> {

    Page<CarOwnerSettlement> findByOwnerId(String ownerId, Pageable pageable);

    Page<CarOwnerSettlement> findByOwnerIdAndStatus(String ownerId, Status status, Pageable pageable);

    @Query("select s from CarOwnerSettlement  s " +
           "where s.ownerId = :ownerId " +
           "and s.createdAt between :start and :end " +
           "and (:status is null or s.status = :status) " +
           "order by s.createdAt desc")
    Page<CarOwnerSettlement> search(
            @Param("ownerId") String ownerId,
            @Param("status") Status status,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            Pageable pageable
    );

    Optional<CarOwnerSettlement> findByIdAndOwnerId(Long id, String ownerId);

    List<CarOwnerSettlement> findTop5ByOwnerIdOrderByCreatedAtDesc(String ownerId);

    // === 서비스에서 쓰는 합계 API ===

    // PAID 금액 합(기간)
    @Query("""
       select coalesce(sum(s.amount), 0)
       from CarOwnerSettlement s
       where s.ownerId = :ownerId
         and s.status = com.fullstack.entity.CarOwnerSettlement$Status.PAID
         and s.createdAt between :start and :end
    """)
    Long sumAmountByOwnerIdAndCreatedAtBetween(
            @Param("ownerId") String ownerId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    // 미정산 금액 합(REQUESTED, APPROVED)
    @Query("""
       select coalesce(sum(s.amount), 0)
       from CarOwnerSettlement s
       where s.ownerId = :ownerId
         and s.status in (
            com.fullstack.entity.CarOwnerSettlement$Status.REQUESTED,
            com.fullstack.entity.CarOwnerSettlement$Status.APPROVED
         )
    """)
    Long sumUnsettledAmountByOwnerId(@Param("ownerId") String ownerId);
}