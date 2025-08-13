package com.fullstack.service;

import com.fullstack.entity.CarOwnerSettlement;
import com.fullstack.repository.CarOwnerSettlementRepository;
import com.fullstack.model.CarOwnerSettlementDTO.SettlementSummaryResponse;
import com.fullstack.model.CarOwnerSettlementDTO.SettlementDetailResponse;
import com.fullstack.model.CarOwnerSettlementDTO.SettlementSummaryCardResponse;
import com.fullstack.model.CarOwnerSettlementDTO.SettlementCreate;
import com.fullstack.entity.CarOwnerSettlement.Status;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;

@Service
@RequiredArgsConstructor
public class CarOwnerSettlementServiceImpl implements CarOwnerSettlementService {

    private final CarOwnerSettlementRepository repo;

    @Transactional(readOnly = true)
    @Override
    public Page<SettlementSummaryResponse> list(String ownerId, int page, int size, String status, LocalDate from, LocalDate to) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Status st = null;
        if (status != null && !status.isBlank()) {
            st = Status.valueOf(status.toUpperCase());
        }

        LocalDateTime start = from == null ? LocalDate.now().minusMonths(3).atStartOfDay()
                                           : from.atStartOfDay();
        LocalDateTime end   = to == null ? LocalDateTime.now()
                                         : to.atTime(LocalTime.MAX);

        Page<CarOwnerSettlement> pageResult = repo.search(ownerId, st, start, end, pageable);
        return pageResult.map(this::toSummary);
    }

    @Transactional(readOnly = true)
    @Override
    public SettlementDetailResponse get(String ownerId, Long settlementId) {
    	CarOwnerSettlement s = repo.findByIdAndOwnerId(settlementId, ownerId)
                .orElseThrow(() -> new IllegalArgumentException("SETTLEMENT_NOT_FOUND"));
        return toDetail(s);
    }

    @Transactional
    @Override
    public SettlementDetailResponse create(String ownerId, SettlementCreate req) {
    	CarOwnerSettlement s = CarOwnerSettlement.builder()
                .ownerId(ownerId)
                .orderId(req.getOrderId())
                .amount(req.getAmount())
                .memo(req.getMemo())
                .status(Status.REQUESTED)
                .build();
        s = repo.save(s);
        return toDetail(s);
    }

    @Transactional
    @Override
    public SettlementDetailResponse approve(String ownerId, Long settlementId, String memo) {
    	CarOwnerSettlement s = repo.findByIdAndOwnerId(settlementId, ownerId)
                .orElseThrow(() -> new IllegalArgumentException("SETTLEMENT_NOT_FOUND"));
        s.approve(memo);
        return toDetail(s);
    }

    @Transactional
    @Override
    public SettlementDetailResponse pay(String ownerId, Long settlementId, String txRef) {
    	CarOwnerSettlement s = repo.findByIdAndOwnerId(settlementId, ownerId)
                .orElseThrow(() -> new IllegalArgumentException("SETTLEMENT_NOT_FOUND"));
        s.pay(txRef);
        return toDetail(s);
    }

    @Transactional
    @Override
    public SettlementDetailResponse cancel(String ownerId, Long settlementId, String memo) {
    	CarOwnerSettlement s = repo.findByIdAndOwnerId(settlementId, ownerId)
                .orElseThrow(() -> new IllegalArgumentException("SETTLEMENT_NOT_FOUND"));
        s.cancel(memo);
        return toDetail(s);
    }

    @Transactional(readOnly = true)
    @Override
    public SettlementSummaryCardResponse summary(String ownerId) {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfToday  = today.atStartOfDay();
        LocalDateTime now           = LocalDateTime.now();
        LocalDateTime startOfMonth  = today.withDayOfMonth(1).atStartOfDay();

        long todayEarnings   = repo.sumAmountByOwnerIdAndCreatedAtBetween(ownerId, startOfToday, now);
        long monthEarnings   = repo.sumAmountByOwnerIdAndCreatedAtBetween(ownerId, startOfMonth, now);
        long unsettledAmount = repo.sumUnsettledAmountByOwnerId(ownerId);

        return SettlementSummaryCardResponse.builder()
                .todayEarnings(todayEarnings)
                .monthEarnings(monthEarnings)
                .unsettledAmount(unsettledAmount)
                .month(today.withDayOfMonth(1))
                .build();
    }

    // ====== mappers ======
    private SettlementSummaryResponse toSummary(CarOwnerSettlement s) {
        return SettlementSummaryResponse.builder()
                .id(s.getId())
                .orderId(s.getOrderId())
                .amount(s.getAmount())
                .status(s.getStatus().name())
                .createdAt(s.getCreatedAt())
                .build();
    }

    private SettlementDetailResponse toDetail(CarOwnerSettlement s) {
        return SettlementDetailResponse.builder()
                .id(s.getId())
                .ownerId(s.getOwnerId())
                .orderId(s.getOrderId())
                .amount(s.getAmount())
                .status(s.getStatus().name())
                .memo(s.getMemo())
                .txRef(s.getTxRef())
                .createdAt(s.getCreatedAt())
                .updatedAt(s.getUpdatedAt())
                .paidAt(s.getPaidAt())
                .build();
    }
}
