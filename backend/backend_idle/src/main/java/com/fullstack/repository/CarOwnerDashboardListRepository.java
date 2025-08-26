package com.fullstack.repository;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fullstack.entity.CarOwnerOrderList;
import com.fullstack.entity.CarOwnerOrderList.Status;

public interface CarOwnerDashboardListRepository extends JpaRepository<CarOwnerOrderList, Long> {

    long countByOwnerIdAndStatus(String ownerId, Status status);

    // 진행중만 (파라미터로 enum 전달)
    @Query("""
           select o
           from CarOwnerOrderList o
           where o.ownerId = :ownerId
             and o.status = :status
           order by o.id desc
           """)
    List<CarOwnerOrderList> findOngoingByOwner(@Param("ownerId") String ownerId,
                                               @Param("status") Status status);

    // 대시보드용: 최근 활성 (CREATED, ONGOING 등) - IN 파라미터
    @Query("""
           select o
           from CarOwnerOrderList o
           where o.ownerId = :ownerId
             and o.status in :statuses
           order by o.updatedAt desc
           """)
    List<CarOwnerOrderList> findRecentActiveByOwner(@Param("ownerId") String ownerId,
                                                    @Param("statuses") Collection<Status> statuses);

    @Query("""
           select function('to_char', o.reservedDate, 'YYYY-MM-DD') as day, count(o) as cnt
           from CarOwnerOrderList o
           where o.ownerId = :ownerId
             and o.reservedDate between :start and :end
           group by function('to_char', o.reservedDate, 'YYYY-MM-DD')
           order by day
           """)
    List<Object[]> countDailyDeliveries(@Param("ownerId") String ownerId,
                                        @Param("start") LocalDateTime start,
                                        @Param("end") LocalDateTime end);
}