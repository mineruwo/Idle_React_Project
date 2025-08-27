package com.fullstack.controller;

import com.fullstack.entity.CarOwnerSettlement;
import com.fullstack.model.CarOwnerSettlementDTO.SettlementDetailResponse;
import com.fullstack.model.CarOwnerSettlementDTO.SettlementSummaryCardResponse;
import com.fullstack.model.CarOwnerSettlementDTO.SettlementSummaryResponse;
import com.fullstack.service.CarOwnerSettlementService;
import jakarta.validation.constraints.Min;
import java.time.LocalDate;
import java.time.YearMonth;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/car-owner/settlements")
public class CarOwnerSettlementController {

    private final CarOwnerSettlementService settlementService;

    public CarOwnerSettlementController(CarOwnerSettlementService settlementService) {
        this.settlementService = settlementService;
    }

    /** 목록 */
    @GetMapping
    public Page<SettlementSummaryResponse> list(
            @AuthenticationPrincipal String ownerId,
            @RequestParam(name = "from", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(name = "to", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "page", defaultValue = "0") @Min(0) int page,
            @RequestParam(name = "size", defaultValue = "20") @Min(1) int size
    ) {
        CarOwnerSettlement.Status st = parseStatusOrNull(status);
        return settlementService.list(ownerId, from, to, st, page, size);
    }

    /** 상세 */
    @GetMapping("/{id}")
    public SettlementDetailResponse detail(
            @AuthenticationPrincipal String ownerId,
            @PathVariable("id") Long id
    ) {
        return settlementService.getDetail(ownerId, id);
    }

    /** 주문 1건 정산 생성 */
    @PostMapping("/order/{orderId}")
    public Long createForOrder(
            @AuthenticationPrincipal String ownerId,
            @PathVariable("orderId") Long orderId
    ) {
        return settlementService.createForOrder(ownerId, orderId);
    }

    /** 월 동기화 */
    @PostMapping("/sync")
    public int syncMonthly(
            @AuthenticationPrincipal String ownerId,
            @RequestParam(name = "ym") String ym
    ) {
        YearMonth yearMonth = YearMonth.parse(ym); // "YYYY-MM"
        return settlementService.syncMonthly(ownerId, yearMonth);
    }

    /** 정산 요청 (READY -> REQUESTED) */
    @PostMapping("/{id}/request")
    public void requestPayout(
            @AuthenticationPrincipal String ownerId,
            @PathVariable("id") Long id
    ) {
        settlementService.requestPayout(ownerId, id);
    }

    /** 요약 카드 */
    @GetMapping("/summary")
    public SettlementSummaryCardResponse summary(
            @AuthenticationPrincipal String ownerId,
            @RequestParam(name = "from", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(name = "to", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return settlementService.summaryCard(ownerId, from, to);
    }

    private CarOwnerSettlement.Status parseStatusOrNull(String status) {
        if (status == null || status.isBlank()) return null;
        try {
            return CarOwnerSettlement.Status.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}