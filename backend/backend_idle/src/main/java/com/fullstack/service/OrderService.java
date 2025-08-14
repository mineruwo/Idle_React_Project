package com.fullstack.service;

import com.fullstack.entity.Order;
import com.fullstack.model.OrderDto;
import com.fullstack.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;

    /** 저장 (DTO -> Entity 매핑) */
    @Transactional
    public Order saveOrder(OrderDto dto) {
        Order order = Order.builder()
                .departure(dto.getDeparture())
                .arrival(dto.getArrival())
                .distance(dto.getDistance())
                .isImmediate(dto.isImmediate())
                .reservedDate(dto.getReservedDate())       // 지금 엔티티가 String이면 그대로 둬도 됨
                .weight(dto.getWeight())
                .vehicle(dto.getVehicle())
                .cargoType(dto.getCargoType())
                .cargoSize(dto.getCargoSize())
                .packingOption(dto.getPackingOption())
                .proposedPrice(dto.getProposedPrice())
                .driverPrice(null)
                .avgPrice(dto.getAvgPrice())
                .status("등록완료")
                .build();

        return orderRepository.save(order); // createdAt은 엔티티 @CreationTimestamp로 자동
    }

    /** ✅ 항상 최신순 목록 */
    @Transactional(readOnly = true)
    public List<Order> getAllOrdersLatest() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    /** 단건 조회 */
    @Transactional(readOnly = true)
    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("order not found: " + id));
    }

    /** (선택) 기존 전체 조회가 필요하면 */
    @Transactional(readOnly = true)
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
}
