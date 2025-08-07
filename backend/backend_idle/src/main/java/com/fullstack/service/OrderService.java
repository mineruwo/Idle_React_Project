package com.fullstack.service;

import com.fullstack.entity.Order;
import com.fullstack.model.OrderDto;
import com.fullstack.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;

    // ✅ 오더 저장
    public Order saveOrder(OrderDto dto) {
        Order order = Order.builder()
                .departure(dto.getDeparture())
                .arrival(dto.getArrival())
                .distance(dto.getDistance())
                .date(dto.getDate())
                .isImmediate(dto.isImmediate())
                .reservedDate(dto.getReservedDate())
                .weight(dto.getWeight())
                .vehicle(dto.getVehicle())
                .cargoType(dto.getCargoType())
                .cargoSize(dto.getCargoSize())
                .packingOption(dto.getPackingOption())     // 요약 텍스트
                .proposedPrice(dto.getProposedPrice())     // 화주가 입력한 제안가
                .driverPrice(null)                         // 기사 제안가는 초기 null
                .status("등록완료")
                .build();

        return orderRepository.save(order);
    }

    // ✅ 전체 오더 조회
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // ✅ 단건 오더 조회
    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("해당 ID의 오더를 찾을 수 없습니다."));
    }
}
