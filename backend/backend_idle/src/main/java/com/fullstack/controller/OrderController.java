// src/main/java/com/fullstack/controller/OrderController.java
package com.fullstack.controller;

import com.fullstack.entity.Order;
import com.fullstack.model.OrderDto;
import com.fullstack.model.enums.OrderStatus; // Added import
import com.fullstack.service.OrderService;
import com.fullstack.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 주문 API
 * - POST /api/orders                 : 주문 등록
 * - GET  /api/orders?q=...           : 목록/검색(주문번호 포함)
 * - GET  /api/orders/{id}            : 단건
 * - GET  /api/orders/{id}/assignment : 배정 정보만
 */
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Log4j2
public class OrderController {

    private final OrderService orderService;
    private final CustomerRepository customerRepository;

    /** 등록 */
    @PostMapping
    public Order save(@RequestBody OrderDto dto, Authentication authentication) {
        log.info("OrderController.save: Received request. Authentication object: {}", authentication);
        String shipperId = authentication.getName();
        // 서비스에서 DTO -> 엔티티 매핑 + 주문번호(orderNo) 자동 생성 처리
        return orderService.saveOrder(dto, shipperId);
    }

    /**
     * 목록/검색
     * - q 없으면 최신순 전체
     * - q 있으면 LIKE 검색(주문번호/출발/도착/상태/차량/화물/크기/포장)
     */
    @GetMapping
    public List<OrderDto> list(@RequestParam(value = "q", required = false) String q) {
        return orderService.searchLatest(q);
    }

    /** 내 주문 목록 조회 */
    @GetMapping("/my")
    public List<OrderDto> findMyOrders(Authentication authentication) {
        String shipperId = authentication.getName();
        return orderService.findMyOrders(shipperId);
    }

    /** 단건 조회 */
    @GetMapping("/{id}")
    public OrderDto findById(@PathVariable("id") Long id) {
        Order orderEntity = orderService.getOrderById(id);
        String shipperId = orderEntity.getShipperId();
        String shipperNickname = customerRepository.findById(shipperId)
                .map(customer -> customer.getNickname())
                .orElse("알 수 없음");
        return OrderDto.fromEntity(orderEntity, shipperNickname);
    }

    /** 배정 정보만 전달 (우측 패널 뱃지/확정가 표시에 사용) */
    @GetMapping("/{id}/assignment")
    public Map<String, Object> getAssignment(@PathVariable(name = "id") Long id) {
        Order o = orderService.getOrderById(id);
        Map<String, Object> res = new HashMap<>();
        // Order 엔티티에 assignedDriverId(Long/Integer) 필드가 있다고 가정
        res.put("assignedDriverId", o.getAssignedDriverId()); // 배정된 기사 ID (없으면 null)
        res.put("driverPrice", o.getDriverPrice());           // 확정가 (없으면 null)
        res.put("status", o.getStatus().name());                     // 예: OPEN/ASSIGNED/등록완료 등 // Converted to enum name
        return res;
    }

    // 주문 상태 업데이트
    @PutMapping("/{id}/status")
    public ResponseEntity<Void> updateOrderStatus(@PathVariable("id") Long id, @RequestBody OrderStatus status, Authentication authentication) { // Changed parameter type
        log.info("User authorities: {}", authentication.getAuthorities());
        orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok().build();
    }
}
