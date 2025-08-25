package com.fullstack.controller;


import com.fullstack.service.CarOwnerSettlementService;
import com.fullstack.model.CarOwnerSettlementDTO.SettlementSummaryResponse;
import com.fullstack.model.CarOwnerSettlementDTO.SettlementCreate;
import com.fullstack.model.CarOwnerSettlementDTO.SettlementDetailResponse;
import com.fullstack.model.CarOwnerSettlementDTO.SettlementMemoRequest;
import com.fullstack.model.CarOwnerSettlementDTO.SettlementPayRequest;
import com.fullstack.model.CarOwnerSettlementDTO.SettlementSummaryCardResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/car-owner/settlements")
@RequiredArgsConstructor
public class CarOwnerSettlementController {

    private final CarOwnerSettlementService settlementService;

    // 목록 (기간/상태/페이징)
    @GetMapping
    public Page<SettlementSummaryResponse> list(
            @AuthenticationPrincipal String ownerId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "status", required = false) String status, // REQUESTED/APPROVED/PAID/CANCELED
            @RequestParam(name = "from", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from, // yyyy-MM-dd
            @RequestParam(name = "to", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to    // yyyy-MM-dd
    ) {
        return settlementService.list(ownerId, page, size, status, from, to);
    }

    // 단건 조회
    @GetMapping("/{settlementId}")
    public SettlementDetailResponse get(
            @AuthenticationPrincipal String ownerId,
            @PathVariable Long settlementId
    ) {
        return settlementService.get(ownerId, settlementId);
    }

    // 생성 (주문 완료 후 정산 요청)
    @PostMapping
    public SettlementDetailResponse create(
            @AuthenticationPrincipal String ownerId,
            @Valid @RequestBody SettlementCreate req
    ) {
        return settlementService.create(ownerId, req);
    }

    // 상태 변경: 승인(사업/회계 플로우에 맞춰 필요하면 관리자 API로 이동)
    @PatchMapping("/{settlementId}/approve")
    public SettlementDetailResponse approve(
            @AuthenticationPrincipal String ownerId,
            @PathVariable Long settlementId,
            @RequestBody(required = false) SettlementMemoRequest body
    ) {
        return settlementService.approve(ownerId, settlementId, body == null ? null : body.getMemo());
    }

    // 상태 변경: 지급 완료
    @PatchMapping("/{settlementId}/pay")
    public SettlementDetailResponse pay(
            @AuthenticationPrincipal String ownerId,
            @PathVariable Long settlementId,
            @RequestBody(required = false) SettlementPayRequest body // 계좌/트랜잭션 메모 등
    ) {
        String txRef = body == null ? null : body.getTxRef();
        return settlementService.pay(ownerId, settlementId, txRef);
    }

    // 상태 변경: 취소
    @PatchMapping("/{settlementId}/cancel")
    public SettlementDetailResponse cancel(
            @AuthenticationPrincipal String ownerId,
            @PathVariable Long settlementId,
            @RequestBody(required = false) SettlementMemoRequest body
    ) {
        return settlementService.cancel(ownerId, settlementId, body == null ? null : body.getMemo());
    }

    // 집계 요약(대시보드 카드용)
    @GetMapping("/summary")
    public SettlementSummaryCardResponse summary(
            @AuthenticationPrincipal String ownerId
    ) {
        return settlementService.summary(ownerId);
    }
}
