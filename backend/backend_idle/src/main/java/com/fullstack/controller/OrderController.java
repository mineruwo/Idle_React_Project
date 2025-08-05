package com.fullstack.controller;

import com.fullstack.entity.Order;
import com.fullstack.model.OrderDto;
import com.fullstack.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public Order save(@RequestBody OrderDto dto) {
        return orderService.saveOrder(dto);
    }
}
