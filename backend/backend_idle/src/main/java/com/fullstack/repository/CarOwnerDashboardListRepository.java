package com.fullstack.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fullstack.entity.CarOwnerOrderList;
import com.fullstack.entity.CarOwnerOrderList.Status;

public interface CarOwnerDashboardListRepository extends JpaRepository<CarOwnerOrderList, Long> {

    long countByOwnerIdAndStatus(String ownerId, Status status);
    
    /** 기존: 진행중(ONGOING)만 */
    @Query("select o from CarOwnerOrderList o " +
           "where o.ownerId = :ownerId and o.status = com.fullstack.entity.CarOwnerOrderList$Status.ONGOING " +
           "order by o.id desc")
    List<CarOwnerOrderList> findOngoingByOwner(@Param("ownerId") String ownerId);

    /** 대시보드용: 최근 활성(READY/ONGOING=CREATED/ONGOING)  */
    @Query("select o from CarOwnerOrderList o " +
           "where o.ownerId = :ownerId and (o.status = com.fullstack.entity.CarOwnerOrderList$Status.CREATED " +
           "or o.status = com.fullstack.entity.CarOwnerOrderList$Status.ONGOING) " +
           "order by o.updatedAt desc")
    List<CarOwnerOrderList> findRecentActiveByOwner(@Param("ownerId") String ownerId);

    /** 일자별 운송건수 (예시 그대로 유지) */
    @Query("select function('to_char', o.reservedDate, 'YYYY-MM-DD') as day, count(o) as cnt " +
           "from CarOwnerOrderList o " +
           "where o.ownerId = :ownerId and o.reservedDate between :start and :end " +
           "group by function('to_char', o.reservedDate, 'YYYY-MM-DD') " +
           "order by day")
    List<Object[]> countDailyDeliveries(@Param("ownerId") String ownerId,
                                        @Param("start") LocalDateTime start,
                                        @Param("end") LocalDateTime end);

    // 정시/지각 통계 (도착 예정 vs 실제 도착)
//    @Query("select " +
//           "sum(case when o.actualArrival is not null and o.expectedArrival is not null and o.actualArrival <= o.expectedArrival then 1 else 0 end) as onTime, " +
//           "sum(case when o.actualArrival is not null and o.expectedArrival is not null and o.actualArrival >  o.expectedArrival then 1 else 0 end) as late " +
//           "from CarOwnerOrderList o where o.ownerId = :ownerId")
//    Object[] countPunctuality(@Param("ownerId") String ownerId);
}
