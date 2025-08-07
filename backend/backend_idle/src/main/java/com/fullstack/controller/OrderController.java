package com.fullstack.controller;

import com.fullstack.entity.Order;
import com.fullstack.model.OrderDto;
import com.fullstack.service.OrderService;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // 🔸 가격 제안 포함 저장
    @PostMapping
    public Order save(@RequestBody OrderDto dto) {
        return orderService.saveOrder(dto);
    }

    @GetMapping
    public List<Order> findAll() {
        return orderService.getAllOrders(); // 📦 오더 전체 조회
    }

    @GetMapping("/{id}")
    public Order findById(@PathVariable Long id) {
        return orderService.getOrderById(id); // 🔍 오더 상세 조회
    }
}
