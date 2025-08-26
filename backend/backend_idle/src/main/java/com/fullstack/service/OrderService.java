// src/main/java/com/fullstack/service/OrderService.java
package com.fullstack.service;

import com.fullstack.entity.Order;
import com.fullstack.model.OrderDto;
import com.fullstack.model.enums.OrderStatus; // Added import
import com.fullstack.repository.OrderRepository;
import com.fullstack.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.fullstack.entity.CustomerEntity;

@Log4j2
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;

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
    public Order saveOrder(OrderDto dto, String shipperId) {
        Order order = Order.builder()
                .shipperId(shipperId)
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
                .status(OrderStatus.CREATED) // Changed to enum
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
    public List<OrderDto> searchLatest(String q) {
        List<Order> orders;
        if (q == null || q.trim().isEmpty()) {
            // createdAt DESC 정렬로 전체 조회
            orders = orderRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        } else {
            // ⚠️ 리포지토리 메서드명과 정확히 일치해야 함 (searchLatest)
            orders = orderRepository.searchLatest(q.trim());//이부분이 오류구간
        }
        return orders.stream()
                .map(this::mapOrderToDtoWithNickname) // Map to DTO with nickname
                .collect(Collectors.toList());
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

    /** 내 주문 목록 조회 */
    @Transactional(readOnly = true)
    public List<OrderDto> findMyOrders(String shipperId) { // Changed return type
        return orderRepository.findByShipperIdOrderByCreatedAtDesc(shipperId).stream()
                .map(this::mapOrderToDtoWithNickname) // Map to DTO with nickname
                .collect(Collectors.toList());
    }

    /** 주문 상태 업데이트 */
    @Transactional
    public Order updateOrderStatus(Long orderId, OrderStatus newStatus) { // Changed parameter type
        log.info("OrderService: Updating order status for ID: {} to {}", orderId, newStatus); // ADD THIS LINE
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with ID: " + orderId));
        
        // TODO: Add validation for status transitions if necessary
        order.setStatus(newStatus);
        return orderRepository.save(order);
    }

    // Helper method to map Order to OrderDto with shipperNickname
    private OrderDto mapOrderToDtoWithNickname(Order order) {
        String shipperNickname = customerRepository.findById(order.getShipperId())
                .map(customer -> customer.getNickname())
                .orElse("알 수 없음"); // Default nickname if not found
        return OrderDto.fromEntity(order, shipperNickname);
    }
}
