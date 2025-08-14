// com.fullstack.service.DriverOfferService
package com.fullstack.service;

import com.fullstack.entity.DriverOffer;
import com.fullstack.entity.Order;
import com.fullstack.model.DriverOfferCreateRequest;
import com.fullstack.model.DriverOfferResponse;
import com.fullstack.repository.DriverOfferRepository;
import com.fullstack.repository.OrderRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DriverOfferService {

    private final DriverOfferRepository driverOfferRepository;
    private final OrderRepository orderRepository;

    @Transactional
    public DriverOfferResponse create(DriverOfferCreateRequest req){
        Order order = orderRepository.findById(req.getOrderId())
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + req.getOrderId()));

        DriverOffer offer = DriverOffer.builder()
                .order(order)
                .driverId(req.getDriverId())
                .price(req.getPrice())
                .memo(req.getMemo())
                .build();

        return DriverOfferResponse.from(driverOfferRepository.save(offer));
    }

    @Transactional
    public List<DriverOfferResponse> listByOrder(Long orderId){
        return driverOfferRepository.findByOrder_IdOrderByCreatedAtDesc(orderId)
                .stream().map(DriverOfferResponse::from).toList();
    }

    @Transactional
    public DriverOfferResponse accept(Long offerId){
        DriverOffer offer = driverOfferRepository.findById(offerId)
                .orElseThrow(() -> new IllegalArgumentException("Offer not found: " + offerId));

        // 수락
        offer.setStatus(DriverOffer.Status.ACCEPTED);

        // 오더에 기사제안가 반영
        Order order = offer.getOrder();
        order.setDriverPrice(offer.getPrice());
        order.setAssignedDriverId(offer.getDriverId());  // ✅ 배정 기사 ID
        order.setStatus("ASSIGNED");                     // ✅ 상태 변경


        // 다른 PENDING은 거절 처리
        driverOfferRepository.rejectOthers(order.getId(), offer.getId());

        return DriverOfferResponse.from(offer);
    }

    @Transactional
    public Long getDriverPriceByOrderId(Long orderId){
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
        return order.getDriverPrice(); // null이면 아직 미수락
    }
}
