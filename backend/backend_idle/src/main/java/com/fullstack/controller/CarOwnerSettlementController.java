package com.fullstack.controller;


import com.fullstack.model.CarOwnerSettlementDTO.SettlementCreate;
import com.fullstack.model.CarOwnerSettlementDTO.SettlementDetailResponse;
import com.fullstack.model.CarOwnerSettlementDTO.SettlementMemoRequest;
import com.fullstack.model.CarOwnerSettlementDTO.SettlementPayRequest;
import com.fullstack.model.CarOwnerSettlementDTO.SettlementSummaryCardResponse;
import com.fullstack.model.CarOwnerSettlementDTO.SettlementSummaryResponse;
import com.fullstack.service.CarOwnerSettlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/car-owner/settlements")
@RequiredArgsConstructor
public class CarOwnerSettlementController {

    private final CarOwnerSettlementService service;

    // 목록 (기간/상태/페이징)  ← fetchSettlements 와 1:1
    @GetMapping
    public Page<SettlementSummaryResponse> list(
            @AuthenticationPrincipal String ownerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String from,   // yyyy-MM-dd
            @RequestParam(required = false) String to      // yyyy-MM-dd
    ) {
        return service.list(ownerId, status, from, to, page, size);
    }

    // 단건 조회  ← fetchSettlementDetail
    @GetMapping("/{id}")
    public SettlementDetailResponse detail(
            @AuthenticationPrincipal String ownerId,
            @PathVariable Long id
    ) {
        return service.get(ownerId, id);
    }

    // 생성  ← createSettlement
    @PostMapping
    public SettlementDetailResponse create(
            @AuthenticationPrincipal String ownerId,
            @RequestBody SettlementCreate req
    ) {
        return service.create(ownerId, req);
    }

    // 승인  ← approveSettlement
    @PatchMapping("/{id}/approve")
    public SettlementDetailResponse approve(
            @AuthenticationPrincipal String ownerId,
            @PathVariable Long id,
            @RequestBody(required = false) SettlementMemoRequest body
    ) {
        return service.approve(ownerId, id, body);
    }

    // 지급  ← paySettlement
    @PatchMapping("/{id}/pay")
    public SettlementDetailResponse pay(
            @AuthenticationPrincipal String ownerId,
            @PathVariable Long id,
            @RequestBody(required = false) SettlementPayRequest body
    ) {
        return service.pay(ownerId, id, body);
    }

    // 취소  ← cancelSettlement
    @PatchMapping("/{id}/cancel")
    public SettlementDetailResponse cancel(
            @AuthenticationPrincipal String ownerId,
            @PathVariable Long id,
            @RequestBody(required = false) SettlementMemoRequest body
    ) {
        return service.cancel(ownerId, id, body);
    }

    // 요약 카드  ← fetchSettlementSummaryCard (엔드포인트명은 summary)
    @GetMapping("/summary")
    public SettlementSummaryCardResponse summary(
            @AuthenticationPrincipal String ownerId
    ) {
        return service.summary(ownerId);
    }
}
