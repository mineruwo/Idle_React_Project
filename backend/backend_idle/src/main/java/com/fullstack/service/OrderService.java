// src/main/java/com/fullstack/service/OrderService.java
package com.fullstack.service;

import com.fullstack.entity.Order;
import com.fullstack.model.OrderDto;
import com.fullstack.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;

/**
 * 주문 서비스
 * - 저장 시 주문번호가 비어 있으면 랜덤으로 생성하고, 중복까지 방지
 * - 검색/목록 통합(searchLatest)
 */
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;

    // 서비스 레벨에서도 충돌 최소화를 위해 생성 + 중복 체크 (엔티티 @PrePersist는 보조)
    private static final String CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RND = new SecureRandom();

    private String newOrderNo() {
        StringBuilder sb = new StringBuilder("ODR-");
        for (int i = 0; i < 10; i++) sb.append(CHARS.charAt(RND.nextInt(CHARS.length())));
        return sb.toString();
    }

    /** 저장 (DTO → Entity 매핑) */
    @Transactional
    public Order saveOrder(OrderDto dto) {
        Order order = Order.builder()
                .departure(dto.getDeparture())
                .arrival(dto.getArrival())
                .distance(dto.getDistance())
                .isImmediate(dto.isImmediate())
                .reservedDate(dto.getReservedDate())
                .weight(dto.getWeight())
                .vehicle(dto.getVehicle())
                .cargoType(dto.getCargoType())
                .cargoSize(dto.getCargoSize())
                .packingOption(dto.getPackingOption())
                .proposedPrice(dto.getProposedPrice())
                .driverPrice(null)     // 기사 확정가는 입찰 확정 시 세팅
                .avgPrice(dto.getAvgPrice())
                .status("등록완료")
                .build();

        // 주문번호 비었으면 생성 + 중복 방지 루프
        if (order.getOrderNo() == null || order.getOrderNo().isBlank()) {
            String no;
            do { no = newOrderNo(); } while (orderRepository.existsByOrderNo(no));
            order.setOrderNo(no);
        }

        return orderRepository.save(order);
    }

    /**
     * 목록/검색 통합
     * - q 없으면 createdAt DESC 전체
     * - q 있으면 LIKE 검색 결과 (createdAt DESC)
     */
    @Transactional(readOnly = true)
    public List<Order> searchLatest(String q) {
        if (q == null || q.trim().isEmpty()) {
            return orderRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        }
        return orderRepository.searchLatest(q.trim());
    }

    /** 단건 조회 */
    @Transactional(readOnly = true)
    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("order not found: " + id));
    }

    /** (필요 시) 전체 조회 */
    @Transactional(readOnly = true)
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
}
