// com.fullstack.repository.DriverOfferRepository
package com.fullstack.repository;

import com.fullstack.entity.DriverOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface DriverOfferRepository extends JpaRepository<DriverOffer, Long> {

    List<DriverOffer> findByOrder_IdOrderByCreatedAtDesc(Long orderId);

    // 선택된 offer 제외한 나머지 PENDING → REJECTED
    @Modifying
    @Query("""
        update DriverOffer o
           set o.status = com.fullstack.entity.DriverOffer$Status.REJECTED
         where o.order.id = :orderId
           and o.id <> :acceptedId
           and o.status = com.fullstack.entity.DriverOffer$Status.PENDING
        """)
    int rejectOthers(Long orderId, Long acceptedId);
}
