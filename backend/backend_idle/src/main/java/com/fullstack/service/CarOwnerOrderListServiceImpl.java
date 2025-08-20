package com.fullstack.service;

import com.fullstack.entity.CarOwnerOrderList;
import com.fullstack.entity.CarOwnerOrderList.Status;
import com.fullstack.model.CarOwnerOrderListDTO;
import com.fullstack.model.CarOwnerOrderListDTO.OrderCreateRequest;
import com.fullstack.model.CarOwnerOrderListDTO.OrderDetailResponse;
import com.fullstack.model.CarOwnerOrderListDTO.OrderSummaryResponse;
import com.fullstack.model.CarOwnerOrderListDTO.OrderUpdateRequest;
import com.fullstack.repository.CarOwnerOrderListRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;

@Service
@RequiredArgsConstructor
public class CarOwnerOrderListServiceImpl implements CarOwnerOrderListService {

    private final CarOwnerOrderListRepository repo;
    private static final ZoneId KST = ZoneId.of("Asia/Seoul");

    @Transactional(readOnly = true)
    @Override
    public Page<CarOwnerOrderListDTO.OrderSummaryResponse> list(String ownerId, int page, int size, String status, LocalDate from, LocalDate to, String q) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "updatedAt"));

        Status st = null;
        if (status != null && !status.isBlank()) {
            st = Status.valueOf(status.toUpperCase());
        }

        LocalDateTime start = (from == null ? LocalDate.now().minusMonths(3).atStartOfDay()
                                            : from.atStartOfDay());
        LocalDateTime end   = (to == null ? LocalDateTime.now()
                                          : to.atTime(LocalTime.MAX));

        return repo.search(ownerId, st, start, end, (q == null ? "" : q.trim()), pageable)
                   .map(this::toSummary);
    }

    @Transactional(readOnly = true)
    @Override
    public CarOwnerOrderListDTO.OrderDetailResponse detail(String ownerId, Long orderId) {
        CarOwnerOrderList o = repo.findByIdAndOwnerId(orderId, ownerId)
                .orElseThrow(() -> new IllegalArgumentException("ORDER_NOT_FOUND"));
        return toDetail(o);
    }

    @Transactional
    @Override
    public OrderDetailResponse create(String ownerId, OrderCreateRequest req) {
        CarOwnerOrderList o = CarOwnerOrderList.builder()
                .ownerId(ownerId)
                .status(Status.CREATED)
                .departure(req.getDeparture())
                .arrival(req.getArrival())
                .cargoType(req.getCargoType())
                .cargoSize(req.getCargoSize())
                .weight(req.getWeight())
                .vehicle(req.getVehicle())
                .immediate(req.isImmediate())
                .reservedDate(req.getReservedDate()) // String 그대로 저장
                .distance(req.getDistance())
                .proposedPrice(req.getProposedPrice())
                .build();
        o = repo.save(o);
        return toDetail(o);
    }

    @Transactional
    @Override
    public OrderDetailResponse update(String ownerId, Long orderId, OrderUpdateRequest req) {
        CarOwnerOrderList o = repo.findByIdAndOwnerId(orderId, ownerId)
                .orElseThrow(() -> new IllegalArgumentException("ORDER_NOT_FOUND"));
        o.applyUpdate(
                req.getDeparture(), req.getArrival(), req.getCargoType(), req.getCargoSize(),
                req.getWeight(), req.getVehicle(), req.getImmediate(), req.getReservedDate(),
                req.getDistance(), req.getProposedPrice()
        );
        return toDetail(o);
    }

    @Transactional
    @Override
    public OrderDetailResponse changeStatus(String ownerId, Long orderId, String status) {
        CarOwnerOrderList o = repo.findByIdAndOwnerId(orderId, ownerId)
                .orElseThrow(() -> new IllegalArgumentException("ORDER_NOT_FOUND"));

        Status next = Status.valueOf(status.toUpperCase());
        Status cur  = o.getStatus();

        // === 전이 규칙 ===
        // 1) 정상 전이만 허용: CREATED->ONGOING, ONGOING->COMPLETED
        boolean normalTransit = (cur == Status.CREATED  && next == Status.ONGOING) ||
                                (cur == Status.ONGOING && next == Status.COMPLETED);

        // 2) 취소 전이 허용: CREATED/ONGOING -> CANCELED (완료 후 취소 불가)
        boolean cancelTransit = (next == Status.CANCELED) &&
                                (cur == Status.CREATED || cur == Status.ONGOING);

        if (!(normalTransit || cancelTransit)) {
            throw new IllegalArgumentException("INVALID_STATUS_TRANSITION");
        }

        // === 당일 취소 금지 ===
        if (cancelTransit) {
            if (isSameDayKST(o.getReservedDate())) { // reservedDate(String) 앞 10자리 비교
                throw new IllegalArgumentException("SAME_DAY_CANCEL_NOT_ALLOWED");
            }
        }

        // 엔티티 도메인 메서드 사용 (낙관적 락은 @Version으로 보호)
        o.changeStatus(next);

        return toDetail(o);
    }

    @Transactional
    @Override
    public OrderDetailResponse assignVehicle(String ownerId, Long orderId, Long vehicleId) {
        CarOwnerOrderList o = repo.findByIdAndOwnerId(orderId, ownerId)
                .orElseThrow(() -> new IllegalArgumentException("ORDER_NOT_FOUND"));
        o.assignVehicle(vehicleId);
        return toDetail(o);
    }

    @Transactional
    @Override
    public void delete(String ownerId, Long orderId) {
        CarOwnerOrderList o = repo.findByIdAndOwnerId(orderId, ownerId)
                .orElseThrow(() -> new IllegalArgumentException("ORDER_NOT_FOUND"));
        repo.delete(o);
    }

    // ===== helpers =====
    private boolean isSameDayKST(String reservedDateStr) {
        if (reservedDateStr == null || reservedDateStr.length() < 10) return false;
        String dateOnly = reservedDateStr.substring(0, 10); // yyyy-MM-dd
        String todayKst = LocalDate.now(KST).toString();    // yyyy-MM-dd
        return todayKst.equals(dateOnly);
    }

    // ===== mappers =====
    private OrderSummaryResponse toSummary(CarOwnerOrderList o) {
        return OrderSummaryResponse.builder()
                .id(o.getId())
                .status(o.getStatus().name())
                .route(o.getDeparture() + "→" + o.getArrival())
                .cargoType(o.getCargoType())
                .price(o.getFinalPrice() != null ? o.getFinalPrice() : o.getProposedPrice())
                .updatedAt(o.getUpdatedAt())
                .build();
    }

    private OrderDetailResponse toDetail(CarOwnerOrderList o) {
        return OrderDetailResponse.builder()
                .id(o.getId())
                .ownerId(o.getOwnerId())
                .status(o.getStatus().name())
                .departure(o.getDeparture())
                .arrival(o.getArrival())
                .cargoType(o.getCargoType())
                .cargoSize(o.getCargoSize())
                .weight(o.getWeight())
                .vehicle(o.getVehicle())
                .immediate(o.isImmediate())
                .reservedDate(o.getReservedDate())
                .distance(o.getDistance())
                .vehicleId(o.getVehicleId())
                .proposedPrice(o.getProposedPrice())
                .finalPrice(o.getFinalPrice())
                .createdAt(o.getCreatedAt())
                .updatedAt(o.getUpdatedAt())
                .build();
    }
}