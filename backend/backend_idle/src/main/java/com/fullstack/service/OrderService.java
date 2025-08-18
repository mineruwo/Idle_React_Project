package com.fullstack.service;

import com.fullstack.entity.Order;
import com.fullstack.model.OrderDto;
import com.fullstack.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
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
                .reservedDate(dto.getReservedDate())   // 엔티티가 String이면 그대로 사용
                .weight(dto.getWeight())
                .vehicle(dto.getVehicle())
                .cargoType(dto.getCargoType())
                .cargoSize(dto.getCargoSize())
                .packingOption(dto.getPackingOption())
                .proposedPrice(dto.getProposedPrice())
                .driverPrice(null)                    // 기사 확정가는 입찰 확정 시 채움
                .avgPrice(dto.getAvgPrice())
                .status("등록완료")
                .build();

        // createdAt/updatedAt은 엔티티의 @CreationTimestamp/@UpdateTimestamp로 자동 세팅
        return orderRepository.save(order);
    }

    /** 최신순 목록 (createdAt DESC) — 리포지토리 커스텀 메서드 없이 사용 */
    @Transactional(readOnly = true)
    public List<Order> getAllOrdersLatest() {
        return orderRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    /** 단건 조회 */
    @Transactional(readOnly = true)
    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("order not found: " + id));
    }

    /** (기본) 전체 조회 */
    @Transactional(readOnly = true)
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
}
