// src/main/java/com/fullstack/service/DriverOfferService.java
package com.fullstack.service;

import com.fullstack.entity.CustomerEntity;
import com.fullstack.entity.DriverOffer;
import com.fullstack.entity.Order;
import com.fullstack.model.DriverOfferCreateRequest;
import com.fullstack.model.DriverOfferResponse;
import com.fullstack.model.OfferAssignRequest;
import com.fullstack.repository.CustomerRepository;
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
    private final CustomerRepository customerRepository;

    /** (기사) 입찰 생성 - 로그인 사용자 idNum으로 기사 세팅 */
    @Transactional
    public DriverOfferResponse create(DriverOfferCreateRequest req, Integer driverIdNum){
        if (driverIdNum == null) throw new IllegalStateException("로그인 사용자 ID가 없습니다.");

        Order order = orderRepository.findById(req.getOrderId())
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + req.getOrderId()));

        CustomerEntity driver = customerRepository.findById(driverIdNum)
                .orElseThrow(() -> new IllegalArgumentException("Driver not found: " + driverIdNum));

        DriverOffer offer = DriverOffer.builder()
                .order(order)
                .driver(driver)
                .price(req.getPrice())
                .memo(req.getMemo())
                .status(DriverOffer.Status.PENDING)
                .build();

        return DriverOfferResponse.from(driverOfferRepository.save(offer));
    }

    /** (공통) 오더별 입찰 목록 */
    @Transactional
    public List<DriverOfferResponse> listByOrder(Long orderId){
        return driverOfferRepository.findByOrder_IdOrderByCreatedAtDesc(orderId)
                .stream().map(DriverOfferResponse::from).toList();
    }

    /** (화주) 입찰 확정 */
    @Transactional
    public DriverOfferResponse accept(Long offerId){
        DriverOffer offer = driverOfferRepository.findById(offerId)
                .orElseThrow(() -> new IllegalArgumentException("Offer not found: " + offerId));

        // 수락
        offer.setStatus(DriverOffer.Status.ACCEPTED);

        // 주문 반영
        Order order = offer.getOrder();
        order.setDriverPrice(offer.getPrice());
        Long assigned = (offer.getDriver() != null && offer.getDriver().getIdNum() != null)
                ? offer.getDriver().getIdNum().longValue() : null;
        order.setAssignedDriverId(assigned);
        order.setStatus("ASSIGNED");

        // 다른 PENDING 거절
        driverOfferRepository.rejectOthers(order.getId(), offer.getId());

        return DriverOfferResponse.from(offer);
    }

    /** (화주) 기사 선택 → 등록+배정 한 번에 */
    @Transactional
    public DriverOfferResponse assignDirect(OfferAssignRequest req) {
        Order order = orderRepository.findById(req.getOrderId())
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + req.getOrderId()));

        if ("ASSIGNED".equalsIgnoreCase(order.getStatus())) {
            throw new IllegalStateException("Order already assigned");
        }

        CustomerEntity driver = customerRepository.findById(req.getDriverId())
                .orElseThrow(() -> new IllegalArgumentException("Driver not found: " + req.getDriverId()));

        // 입찰 생성(PENDING)
        DriverOffer offer = driverOfferRepository.save(
                DriverOffer.builder()
                        .order(order)
                        .driver(driver)
                        .price(req.getPrice())
                        .memo(req.getMemo())
                        .status(DriverOffer.Status.PENDING)
                        .build()
        );

        // 즉시 확정
        offer.setStatus(DriverOffer.Status.ACCEPTED);
        order.setDriverPrice(offer.getPrice());
        order.setAssignedDriverId(driver.getIdNum().longValue());
        order.setStatus("ASSIGNED");

        // 다른 PENDING 거절
        driverOfferRepository.rejectOthers(order.getId(), offer.getId());

        return DriverOfferResponse.from(offer);
    }

    /** (선택) 배정가만 조회 */
    @Transactional
    public Long getDriverPriceByOrderId(Long orderId){
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
        return order.getDriverPrice();
    }
}
