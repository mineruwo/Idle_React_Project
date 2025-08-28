package com.fullstack.repository;

import com.fullstack.entity.DriverOffer;
import com.fullstack.entity.Order;
import com.fullstack.entity.DriverOffer.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DriverOfferRepository extends JpaRepository<DriverOffer, Long> {

    @Query("SELECT do FROM DriverOffer do JOIN FETCH do.driver WHERE do.id = :id")
    Optional<DriverOffer> findByIdWithDriver(@Param("id") Long id);

    /** 특정 오더의 입찰 목록 (최신순) */
    List<DriverOffer> findByOrder_IdOrderByCreatedAtDesc(@Param("orderId") Long orderId);

    // Order와 Status로 DriverOffer를 찾는 메소드 추가
    Optional<DriverOffer> findByOrderAndStatus(Order order, DriverOffer.Status status);

    /**
     * 선택된 offer(acceptedId)를 제외한 같은 주문의 나머지 PENDING들을 REJECTED로 일괄 변경
     * - 서비스 레이어(@Transactional) 안에서 호출되어야 함
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
        update DriverOffer o
           set o.status = com.fullstack.entity.DriverOffer$Status.REJECTED
         where o.order.id = :orderId
           and o.id <> :acceptedId
           and o.status = com.fullstack.entity.DriverOffer$Status.PENDING
        """)
    int rejectOthers(@Param("orderId") Long orderId,
                     @Param("acceptedId") Long acceptedId);
}