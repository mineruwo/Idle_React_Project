package com.fullstack.controller;

import com.fullstack.entity.Order;
import com.fullstack.model.OrderDto;
import com.fullstack.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService; // ✅ 서비스만 주입

    // ✅ 등록 (DTO 사용) — createdAt은 엔티티에서 자동 기록
    @PostMapping
    public Order save(@RequestBody OrderDto dto) {
        return orderService.saveOrder(dto);
    }

    // ✅ 목록 (항상 최신순)
    @GetMapping
    public List<Order> findAllLatest() {
        return orderService.getAllOrders();
    }

    // ✅ 단건 조회
    @GetMapping("/{id}")
    public Order findById(@PathVariable Long id) {
        return orderService.getOrderById(id);
    }
}
