// src/main/java/com/fullstack/service/DriverOfferService.java
package com.fullstack.service;

import com.fullstack.entity.CustomerEntity;
import com.fullstack.entity.DriverOffer;
import com.fullstack.entity.OrderEntity;
import com.fullstack.model.DriverOfferCreateRequest;
import com.fullstack.model.DriverOfferResponse;
import com.fullstack.model.OfferAssignRequest;
import com.fullstack.model.enums.OrderStatus; // Added import
import com.fullstack.repository.CustomerRepository;
import com.fullstack.repository.DriverOfferRepository;
import com.fullstack.repository.OrderRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import org.springframework.stereotype.Service;

import java.util.List;

@Log4j2
@Service
@RequiredArgsConstructor
public class DriverOfferService {

    private final DriverOfferRepository driverOfferRepository;
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;

    /**
     * (기사) 입찰 생성 - 로그인된 ID_NUM으로 기사 세팅
     */
    @Transactional
    public DriverOfferResponse create(DriverOfferCreateRequest req, Integer driverIdNum) {
        if (driverIdNum == null) throw new IllegalStateException("로그인 사용자 ID가 없습니다.");
        if (req.getOrderId() == null) throw new IllegalArgumentException("orderId가 필요합니다.");
        if (req.getPrice() == null || req.getPrice() <= 0) throw new IllegalArgumentException("유효한 제안가가 아닙니다.");

        OrderEntity order = orderRepository.findById(req.getOrderId())
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + req.getOrderId()));

        // 이미 확정 단계(결제대기/완료)인 주문에는 입찰 불가
        String os = String.valueOf(order.getStatus()).toUpperCase();
        if ("PAYMENT_PENDING".equals(os) || "ASSIGNED".equals(os) || "COMPLETED".equals(os)) {
            throw new IllegalStateException("이미 배정(확정)된 주문입니다.");
        }

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
    @Transactional(Transactional.TxType.SUPPORTS)
    public List<DriverOfferResponse> listByOrder(Long orderId) {
        if (orderId == null) throw new IllegalArgumentException("orderId가 필요합니다.");
        return driverOfferRepository.findByOrder_IdOrderByCreatedAtDesc(orderId)
                .stream()
                .map(DriverOfferResponse::from)
                .toList();
    }

    /**
     * (화주) 특정 입찰 확정
     * - 선택 입찰 ACCEPTED
     * - 주문 상태는 'PAYMENT_PENDING'(결제대기)로 전환
     * - 동일 주문의 다른 PENDING 입찰은 REJECT
     */
    @Transactional
    public DriverOfferResponse accept(Long offerId) {
        if (offerId == null) throw new IllegalArgumentException("offerId가 필요합니다.");

        DriverOffer offer = driverOfferRepository.findByIdWithDriver(offerId) // Use new method
                .orElseThrow(() -> new IllegalArgumentException("Offer not found: " + offerId));

        OrderEntity order = offer.getOrder();

        String os = String.valueOf(order.getStatus()).toUpperCase();
        if ("PAYMENT_PENDING".equals(os) || "ASSIGNED".equals(os) || "COMPLETED".equals(os)) {
            // 이미 확정 이후 단계면 현재 오퍼 상태만 반환
            return DriverOfferResponse.from(offer);
        }

        // 확정
        offer.setStatus(DriverOffer.Status.ACCEPTED);

        // 주문 반영
        order.setDriverPrice(offer.getPrice());
        Long assigned = (offer.getDriver() != null && offer.getDriver().getIdNum() != null)
                ? offer.getDriver().getIdNum().longValue() : null;
        order.setAssignedDriverId(assigned);
        order.setStatus(OrderStatus.PAYMENT_PENDING);
        // 다른 PENDING 전부 거절
        driverOfferRepository.rejectOthers(order.getId(), offer.getId());

        return DriverOfferResponse.from(offer);
    }

    /**
     * (화주) 기사 직접 선택 → 입찰 생성 + 즉시 확정
     * - 주문 상태는 'PAYMENT_PENDING'(결제대기)로 전환
     */
    @Transactional
    public DriverOfferResponse assignDirect(OfferAssignRequest req) {
        if (req.getOrderId() == null) throw new IllegalArgumentException("orderId가 필요합니다.");
        if (req.getDriverId() == null) throw new IllegalArgumentException("driverId(=ID_NUM)가 필요합니다.");
        if (req.getPrice() == null || req.getPrice() <= 0) throw new IllegalArgumentException("유효한 제안가가 아닙니다.");

        OrderEntity order = orderRepository.findById(req.getOrderId())
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + req.getOrderId()));

        if (OrderStatus.READY.equals(order.getStatus()) || OrderStatus.ONGOING.equals(order.getStatus())) {
            throw new IllegalStateException("Order already assigned");
        }

        CustomerEntity driver = customerRepository.findById(req.getDriverId())
                .orElseThrow(() -> new IllegalArgumentException("Driver not found: " + req.getDriverId()));

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
        // ✅ 결제대기 전환
        order.setStatus(OrderStatus.PAYMENT_PENDING);

        driverOfferRepository.rejectOthers(order.getId(), offer.getId());

        return DriverOfferResponse.from(offer);
    }

    /** (선택) 배정가만 조회 */
    @Transactional(Transactional.TxType.SUPPORTS)
    public Long getDriverPriceByOrderId(Long orderId) {
        if (orderId == null) throw new IllegalArgumentException("orderId가 필요합니다.");
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
        return order.getDriverPrice();
    }
}
