package com.fullstack.repository;

import com.fullstack.entity.CarOwnerOrderList;
import com.fullstack.entity.CarOwnerOrderList.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CarOwnerOrderListRepository extends JpaRepository<CarOwnerOrderList, Long> {

    long countByOwnerId(String ownerId);
    long countByOwnerIdAndStatus(String ownerId, Status status);
    long countByOwnerIdAndStatusAndUpdatedAtBetween(String ownerId, Status status, LocalDateTime start, LocalDateTime end);

    List<CarOwnerOrderList> findTop5ByOwnerIdOrderByUpdatedAtDesc(String ownerId);

    Optional<CarOwnerOrderList> findByIdAndOwnerId(Long id, String ownerId);

    // 진행중 리스트 (최근순)
    List<CarOwnerOrderList> findByOwnerIdAndStatusOrderByUpdatedAtDesc(
            String ownerId, CarOwnerOrderList.Status status);

    // 일자별 운송건수 집계 (updatedAt 기준)
    @Query("""
            select function('to_char', o.updatedAt, 'YYYY-MM-DD') as day, count(o) as cnt
            from CarOwnerOrderList o
            where o.ownerId = :ownerId
              and o.updatedAt between :start and :end
            group by function('to_char', o.updatedAt, 'YYYY-MM-DD')
            order by day
        """)
    List<Object[]> countDailyDeliveries(
            @Param("ownerId") String ownerId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    // 검색/필터/페이징
    @Query(value = """
            select o from CarOwnerOrderList o
            where o.ownerId = :ownerId
              and (:status is null or o.status = :status)
              and o.updatedAt between :start and :end
              and (
                   :q is null or :q = '' or
                   lower(o.departure) like lower(concat('%', :q, '%')) or
                   lower(o.arrival)   like lower(concat('%', :q, '%')) or
                   lower(o.cargoType) like lower(concat('%', :q, '%'))
              )
            order by o.updatedAt desc
            """,
            countQuery = """
            select count(o) from CarOwnerOrderList o
            where o.ownerId = :ownerId
              and (:status is null or o.status = :status)
              and o.updatedAt between :start and :end
              and (
                   :q is null or :q = '' or
                   lower(o.departure) like lower(concat('%', :q, '%')) or
                   lower(o.arrival)   like lower(concat('%', :q, '%')) or
                   lower(o.cargoType) like lower(concat('%', :q, '%'))
              )
            """)
    Page<CarOwnerOrderList> search(@Param("ownerId") String ownerId,
                                   @Param("status") Status status,
                                   @Param("start") LocalDateTime start,
                                   @Param("end") LocalDateTime end,
                                   @Param("q") String q,
                                   Pageable pageable);
}
