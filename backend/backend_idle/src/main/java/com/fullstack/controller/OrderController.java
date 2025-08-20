package com.fullstack.controller;

import com.fullstack.entity.Order;
import com.fullstack.model.OrderDto;
import com.fullstack.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // 등록
    @PostMapping
    public Order save(@RequestBody OrderDto dto) {
        return orderService.saveOrder(dto);
    }

    // 목록
    @GetMapping
    public List<Order> findAllLatest() {
        return orderService.getAllOrders();
    }

    // 단건 조회  ✅ 오타/괄호 정리
    @GetMapping("/{id}")
    public OrderDto findById(@PathVariable("id") Long id) {
        Order orderEntity = orderService.getOrderById(id);
        return OrderDto.fromEntity(orderEntity); // DTO로 변환 후 반환
    }

    // 배정 정보만 전달: { assignedDriverId, driverPrice, status }
    @GetMapping("/{id}/assignment")
    public Map<String, Object> getAssignment(@PathVariable Long id) {
        Order o = orderService.getOrderById(id);
        Map<String, Object> res = new HashMap<>();
        res.put("assignedDriverId", o.getAssignedDriverId()); // 배정된 기사 ID (없으면 null)
        res.put("driverPrice", o.getDriverPrice());           // 확정가 (없으면 null)
        res.put("status", o.getStatus());                     // OPEN/ASSIGNED/...
        return res;
    }

    // 주문 상태 업데이트
    @PutMapping("/{id}/status")
    public ResponseEntity<Void> updateOrderStatus(@PathVariable("id") Long id, @RequestBody String status) {
        orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok().build();
    }
}
