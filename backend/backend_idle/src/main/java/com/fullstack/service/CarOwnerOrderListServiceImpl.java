package com.fullstack.service;

import com.fullstack.entity.CustomerEntity;
import com.fullstack.entity.Order;
import com.fullstack.model.CarOwnerOrderListDTO;
import com.fullstack.model.enums.OrderStatus;
import com.fullstack.repository.CustomerRepository;
import com.fullstack.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;

@Service
@RequiredArgsConstructor
public class CarOwnerOrderListServiceImpl implements CarOwnerOrderListService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final CarOwnerSettlementService settlementService;  // ✅ 정산 서비스 주입

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");

    private Long getDriverId(String loginId) {
        CustomerEntity me = customerRepository.findByLoginId(loginId)
                .orElseThrow(() -> new AccessDeniedException("AUTH_USER_NOT_FOUND"));
        return me.getIdNum().longValue();
    }

    @Transactional(readOnly = true)
    @Override
    public Page<CarOwnerOrderListDTO.OrderSummaryResponse> list(
            String loginId, int page, int size, String status, LocalDate from, LocalDate to, String q) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "updatedAt"));
        Long driverId = getDriverId(loginId);

        LocalDateTime start;
        LocalDateTime end;

        if (from == null && to == null) {
            // 기본값: 이번 달 1일 ~ 말일
            LocalDate today = LocalDate.now(KST);
            LocalDate firstDay = today.withDayOfMonth(1);
            LocalDate lastDay = today.withDayOfMonth(today.lengthOfMonth());
            start = firstDay.atStartOfDay();
            end = lastDay.atTime(LocalTime.MAX);
        } else {
            start = (from == null ? LocalDate.now().minusMonths(3).atStartOfDay() : from.atStartOfDay());
            end   = (to == null ? LocalDateTime.now() : to.atTime(LocalTime.MAX));
        }

        // status → enum
        OrderStatus statusEnum = null;
        if (status != null && !status.isBlank()) {
            statusEnum = OrderStatus.valueOf(status.toUpperCase());
        }

        Page<Order> pageData = orderRepository.searchForDriver(
                driverId,
                statusEnum,
                start,
                end,
                (q == null ? "" : q.trim()),
                pageable
        );

        return pageData.map(this::toSummary);
    }

    @Transactional(readOnly = true)
    @Override
    public CarOwnerOrderListDTO.OrderDetailResponse detail(String loginId, Long orderId) {
        Long driverId = getDriverId(loginId);
        Order o = orderRepository.findByIdAndAssignedDriverId(orderId, driverId)
                .orElseThrow(() -> new AccessDeniedException("FORBIDDEN_ORDER_OWNER"));
        return toDetail(o);
    }

    @Transactional
    @Override
    public CarOwnerOrderListDTO.OrderDetailResponse create(String loginId, CarOwnerOrderListDTO.OrderCreateRequest req) {
        Long driverId = getDriverId(loginId);
        Order o = Order.builder()
                .assignedDriverId(driverId)
                .status(OrderStatus.READY)
                .departure(req.getDeparture())
                .arrival(req.getArrival())
                .distance(req.getDistance())
                .reservedDate(req.getReservedDate())
                .isImmediate(req.isImmediate())
                .weight(req.getWeight())
                .vehicle(req.getVehicle())
                .cargoType(req.getCargoType())
                .cargoSize(req.getCargoSize())
                .packingOption(req.getPackingOption())
                .proposedPrice(req.getProposedPrice())
                .build();
        o = orderRepository.save(o);
        return toDetail(o);
    }

    @Transactional
    @Override
    public CarOwnerOrderListDTO.OrderDetailResponse update(String loginId, Long orderId, CarOwnerOrderListDTO.OrderUpdateRequest req) {
        Long driverId = getDriverId(loginId);
        Order o = orderRepository.findByIdAndAssignedDriverId(orderId, driverId)
                .orElseThrow(() -> new AccessDeniedException("FORBIDDEN_ORDER_OWNER"));

        if (req.getDeparture() != null) o.setDeparture(req.getDeparture());
        if (req.getArrival() != null)   o.setArrival(req.getArrival());
        if (req.getDistance() != null)  o.setDistance(req.getDistance());
        if (req.getReservedDate() != null) o.setReservedDate(req.getReservedDate());
        if (req.getWeight() != null)    o.setWeight(req.getWeight());
        if (req.getVehicle() != null)   o.setVehicle(req.getVehicle());
        if (req.getCargoType() != null) o.setCargoType(req.getCargoType());
        if (req.getCargoSize() != null) o.setCargoSize(req.getCargoSize());
        if (req.getPackingOption() != null) o.setPackingOption(req.getPackingOption());
        if (req.getProposedPrice() != null) o.setProposedPrice(req.getProposedPrice());
        if (req.getDriverPrice() != null)   o.setDriverPrice(req.getDriverPrice());

        // ⚠️ 만약 이미 COMPLETED 상태에서 운임이 바뀌면 정산 금액도 재계산해야 함.
        // 현재 createForOrder는 "존재 시 그대로 리턴"이라 재계산을 하지 않음.
        // 재계산이 필요하면 settlementService에 별도 upsert/recalc 메서드를 만들어 여기서 호출해줘.
        // 예) if (o.getStatus() == OrderStatus.COMPLETED) settlementService.recalcForOrder(o.getId());

        return toDetail(o);
    }

    @Transactional
    @Override
    public CarOwnerOrderListDTO.OrderDetailResponse changeStatus(
            String loginId, Long orderId, OrderStatus nextStatus) {

        Long driverId = getDriverId(loginId);
        Order o = orderRepository.findByIdAndAssignedDriverId(orderId, driverId)
                .orElseThrow(() -> new AccessDeniedException("FORBIDDEN_ORDER_OWNER"));

        OrderStatus cur  = o.getStatus();
        OrderStatus next = nextStatus;

        boolean normal =
                (cur == OrderStatus.READY   && next == OrderStatus.ONGOING) ||
                (cur == OrderStatus.ONGOING && next == OrderStatus.COMPLETED);

        boolean cancel =
                (next == OrderStatus.CANCELED) &&
                (cur == OrderStatus.READY || cur == OrderStatus.ONGOING);

        if (!(normal || cancel)) {
            throw new IllegalArgumentException("INVALID_STATUS_TRANSITION");
        }

        if (cancel && isSameDayKST(o.getReservedDate())) {
            throw new IllegalArgumentException("SAME_DAY_CANCEL_NOT_ALLOWED");
        }

        o.setStatus(next);

        // 정산 테이블에 오더정보 insert (ONGOING → COMPLETED 전이 시에만)
        if (cur == OrderStatus.ONGOING && next == OrderStatus.COMPLETED) {
            
            orderRepository.saveAndFlush(o);
            
            settlementService.createForOrder(String.valueOf(driverId), o.getId());
             }

        return toDetail(o);
    }

    @Transactional
    @Override
    public void delete(String loginId, Long orderId) {
        Long driverId = getDriverId(loginId);
        Order o = orderRepository.findByIdAndAssignedDriverId(orderId, driverId)
                .orElseThrow(() -> new AccessDeniedException("FORBIDDEN_ORDER_OWNER"));
        orderRepository.delete(o);
    }

    // ===== helpers =====
    private boolean isSameDayKST(String reservedDateStr) {
        if (reservedDateStr == null || reservedDateStr.length() < 10) return false;
        String dateOnly = reservedDateStr.substring(0, 10);
        String todayKst = LocalDate.now(KST).toString();
        return todayKst.equals(dateOnly);
    }

    // ===== mappers =====
    private CarOwnerOrderListDTO.OrderSummaryResponse toSummary(Order o) {
        Long price = (o.getDriverPrice() != null) ? o.getDriverPrice()
                                                  : (o.getProposedPrice() == null ? null : o.getProposedPrice().longValue());
        return CarOwnerOrderListDTO.OrderSummaryResponse.builder()
                .id(o.getId())
                .status(o.getStatus().name())
                .route(safeJoin(o.getDeparture(), "→", o.getArrival()))
                .cargoType(o.getCargoType())
                .price(price)
                .updatedAt(o.getUpdatedAt())
                .departure(o.getDeparture())
                .arrival(o.getArrival())
                .s_date(o.getReservedDate())
                .build();
    }

    private static String safeJoin(String a, String sep, String b) {
        String left = (a == null ? "" : a);
        String right = (b == null ? "" : b);

        if (left.isEmpty() && right.isEmpty()) return "";
        if (left.isEmpty()) return right;
        if (right.isEmpty()) return left;
        return left + sep + right;
    }

    private CarOwnerOrderListDTO.OrderDetailResponse toDetail(Order o) {
        return CarOwnerOrderListDTO.OrderDetailResponse.builder()
                .id(o.getId())
                .assignedDriverId(o.getAssignedDriverId())
                .status(o.getStatus().name())
                .departure(o.getDeparture())
                .arrival(o.getArrival())
                .distance(o.getDistance())
                .reservedDate(o.getReservedDate())
                .weight(o.getWeight())
                .vehicle(o.getVehicle())
                .cargoType(o.getCargoType())
                .cargoSize(o.getCargoSize())
                .packingOption(o.getPackingOption())
                .proposedPrice(o.getProposedPrice())
                .driverPrice(o.getDriverPrice())
                .avgPrice(o.getAvgPrice())
                .createdAt(o.getCreatedAt())
                .updatedAt(o.getUpdatedAt())
                .build();
    }
}