// com.fullstack.repository.DriverOfferRepository
package com.fullstack.repository;

import com.fullstack.entity.DriverOffer;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DriverOfferRepository extends JpaRepository<DriverOffer, Long> {

    List<DriverOffer> findByOrder_IdOrderByCreatedAtDesc(Long orderId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update DriverOffer o set o.status = 'REJECTED' " +
           "where o.order.id = :orderId and o.id <> :acceptedId and o.status = 'PENDING'")
    int rejectOthers(@Param("orderId") Long orderId, @Param("acceptedId") Long acceptedId);
}
