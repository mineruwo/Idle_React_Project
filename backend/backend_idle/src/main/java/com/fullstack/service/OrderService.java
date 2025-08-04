package com.fullstack.service;

import com.fullstack.entity.Order;
import com.fullstack.model.OrderDto;
import com.fullstack.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;

    public Order saveOrder(OrderDto dto) {
        Order order = Order.builder()
                .departure(dto.getDeparture())
                .arrival(dto.getArrival())
                .cargoType(dto.getCargoType())
                .cargoSize(dto.getCargoSize())
                .weight(dto.getWeight())
                .vehicle(dto.getVehicle())
                .isImmediate(dto.isImmediate())
                .reservedDate(dto.getReservedDate())
                .distance(dto.getDistance())
                .build();

        return orderRepository.save(order);
    }
}