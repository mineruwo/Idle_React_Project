package com.fullstack.repository;


import java.time.LocalDate;
import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fullstack.entity.CarOwnerSettlement;

public interface CarOwnerSettlementRepository extends JpaRepository<CarOwnerSettlement, Long> {

    boolean existsByOrderId(Long orderId);

    @Query("""
      select s
      from CarOwnerSettlement s
      join s.batch b
      where b.ownerId = :ownerId
        and (:status is null or b.status = :status)
        and (:fromMonth is null or b.monthKey >= :fromMonth)
        and (:toMonth   is null or b.monthKey <  :toNextMonth)
      order by b.monthKey desc, s.id desc
    """)
    Page<CarOwnerSettlement> search(
            @Param("ownerId") String ownerId,
            @Param("status") String status,      // REQUESTED/APPROVED/PAID/CANCELED or null
            @Param("fromMonth") LocalDate fromMonthFirst, // yyyy-MM-01
            @Param("toNextMonth") LocalDate toMonthNextFirst, // (to 월의 다음달 1일)
            Pageable pageable
    );

    @Query("""
      select s
      from CarOwnerSettlement s
      join s.batch b
      where s.id = :id and b.ownerId = :ownerId
    """)
    CarOwnerSettlement findOneForOwner(@Param("id") Long id, @Param("ownerId") String ownerId);
}