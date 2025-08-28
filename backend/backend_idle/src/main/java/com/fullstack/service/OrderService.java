package com.fullstack.service;

import com.fullstack.entity.Order;
import com.fullstack.entity.PaymentEntity;
import com.fullstack.model.OrderDto;
import com.fullstack.model.enums.OrderStatus;
import com.fullstack.repository.OrderRepository;
import com.fullstack.repository.CustomerRepository;
import com.fullstack.repository.PaymentRepository;
import com.fullstack.repository.DriverOfferRepository;
import com.fullstack.entity.DriverOffer;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.fullstack.entity.CustomerEntity;

@Log4j2
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final PaymentRepository paymentRepository;
    private final DriverOfferRepository driverOfferRepository;

    private static final String CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RND = new SecureRandom();

    private String newOrderNo() {
        StringBuilder sb = new StringBuilder("ODR-");
        for (int i = 0; i < 10; i++) sb.append(CHARS.charAt(RND.nextInt(CHARS.length())));
        return sb.toString();
    }

    @Transactional
    public Order saveOrder(OrderDto dto, String shipperId) {
        Order order = Order.builder()
                .shipperId(shipperId)
                .departure(dto.getDeparture())
                .arrival(dto.getArrival())
                .distance(dto.getDistance())
                .isImmediate(dto.isImmediate())
                .reservedDate(dto.getReservedDate())
                .weight(dto.getWeight())
                .vehicle(dto.getVehicle())
                .cargoType(dto.getCargoType())
                .cargoSize(dto.getCargoSize())
                .packingOption(dto.getPackingOption())
                .proposedPrice(dto.getProposedPrice())
                .driverPrice(null)
                .avgPrice(dto.getAvgPrice())
                .status(OrderStatus.CREATED)
                .build();

        if (order.getOrderNo() == null || order.getOrderNo().isBlank()) {
            String no;
            do { no = newOrderNo(); } while (orderRepository.existsByOrderNo(no));
            order.setOrderNo(no);
        }

        return orderRepository.save(order);
    }

    @Transactional(readOnly = true)
    public List<OrderDto> searchLatest(String q) {
        List<Order> orders;
        if (q == null || q.trim().isEmpty()) {
            orders = orderRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        } else {
            orders = orderRepository.searchLatest(q.trim());
        }
        return orders.stream()
                .map(order -> {
                    OrderDto dto = this.mapOrderToDtoWithNickname(order);
                    // Use new method for payment and remove debug log
                    paymentRepository.findTopByOrderAndPaymentStatusOrderByPaidAtDesc(order, "PAID").ifPresent(payment -> {
                        dto.setPaidAt(payment.getPaidAt());
                    });
                    driverOfferRepository.findByOrderAndStatus(order, DriverOffer.Status.ACCEPTED)
                            .ifPresent(acceptedOffer -> {
                                dto.setAssignedAt(acceptedOffer.getCreatedAt());
                            });
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderDto> findMyOrders(String shipperId) {
        return orderRepository.findByShipperIdOrderByCreatedAtDesc(shipperId).stream()
                .map(order -> {
                    OrderDto dto = this.mapOrderToDtoWithNickname(order);
                    // Use new method for payment and remove debug log
                    paymentRepository.findTopByOrderAndPaymentStatusOrderByPaidAtDesc(order, "PAID").ifPresent(payment -> {
                        dto.setPaidAt(payment.getPaidAt());
                    });
                    driverOfferRepository.findByOrderAndStatus(order, DriverOffer.Status.ACCEPTED)
                            .ifPresent(acceptedOffer -> {
                                dto.setAssignedAt(acceptedOffer.getCreatedAt());
                            });
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("order not found: " + id));
    }

    @Transactional(readOnly = true)
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    /** 주문 상태 업데이트 */
    @Transactional
    public Order updateOrderStatus(Long orderId, OrderStatus newStatus) {
        log.info("OrderService: Updating order status for ID: {} to {}", orderId, newStatus);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with ID: " + orderId));

        if (newStatus == OrderStatus.ONGOING) {
            order.setDepartedAt(LocalDateTime.now());
        } else if (newStatus == OrderStatus.COMPLETED) {
            order.setCompletedAt(LocalDateTime.now());
        }

        order.setStatus(newStatus);
        return orderRepository.save(order);
    }

    private OrderDto mapOrderToDtoWithNickname(Order order) {
        String shipperNickname = customerRepository.findById(order.getShipperId())
                .map(customer -> customer.getNickname())
                .orElse("알 수 없음");
        return OrderDto.fromEntity(order, shipperNickname);
    }
}