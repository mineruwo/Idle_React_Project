// src/main/java/com/fullstack/controller/OrderController.java
package com.fullstack.controller;

import com.fullstack.entity.Order;
import com.fullstack.model.OrderDto;
import com.fullstack.service.OrderService;
import lombok.RequiredArgsConstructor;
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
public class OrderController {

    private final OrderService orderService;

    /** 등록 */
    @PostMapping
    public Order save(@RequestBody OrderDto dto) {
        return orderService.saveOrder(dto);
    }

    /**
     * 목록/검색
     * - q 없으면 최신순 전체
     * - q 있으면 LIKE 검색(주문번호/출발/도착/상태/차량/화물/크기/포장)
     */
    @GetMapping
    public List<Order> list(@RequestParam(name = "q", required = false) String q) {
        return orderService.searchLatest(q);
    }

    /** 단건 조회 */
    @GetMapping("/{id}")
    public Order findById(@PathVariable(name = "id") Long id) {
        return orderService.getOrderById(id);
    }

    /** 배정 정보만 전달 (우측 패널 뱃지/확정가 표시에 사용) */
    @GetMapping("/{id}/assignment")
    public Map<String, Object> getAssignment(@PathVariable(name = "id") Long id) {
        Order o = orderService.getOrderById(id);
        Map<String, Object> res = new HashMap<>();
        res.put("assignedDriverId", o.getAssignedDriverId());
        res.put("driverPrice", o.getDriverPrice());
        res.put("status", o.getStatus());
        return res;
    }
}
