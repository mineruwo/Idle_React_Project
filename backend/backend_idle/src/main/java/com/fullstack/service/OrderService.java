package com.fullstack.service;

import com.fullstack.entity.Order;
import com.fullstack.model.OrderDto;
import com.fullstack.repository.OrderRepository;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;

    public Order saveOrder(OrderDto dto) {
        Order order = Order.builder()
                .departure(dto.getDeparture())
                .arrival(dto.getArrival())
                .distance(dto.getDistance())
                .date(dto.getDate())
                .isImmediate(dto.isImmediate())
                .weight(dto.getWeight())
                .vehicle(dto.getVehicle())
                .cargoType(dto.getCargoType())
                .cargoSize(dto.getCargoSize())
                .packingOptions(dto.getPackingOptions())
                .status("등록완료")
                .build();

        return orderRepository.save(order);
    }
    
 // ✅ 오더 전체 조회
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // ✅ 오더 단건 조회
    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("해당 ID의 오더를 찾을 수 없습니다."));
    }
}
