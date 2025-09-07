package com.fullstack.controller;

import com.fullstack.entity.CarOwnerSettlementEntity.Status;
import com.fullstack.model.CarOwnerSettlementDTO.SettlementDetailResponse;
import com.fullstack.model.CarOwnerSettlementDTO.SettlementSummaryCardResponse;
import com.fullstack.model.CarOwnerSettlementDTO.SettlementSummaryResponse;
import com.fullstack.repository.CustomerRepository;
import com.fullstack.entity.CustomerEntity;
import com.fullstack.service.CarOwnerSettlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.time.YearMonth;

@RestController
@RequestMapping("/api/car-owner/settlements")
@RequiredArgsConstructor
public class CarOwnerSettlementController {

    private final CarOwnerSettlementService settlementService;
    private final CustomerRepository customerRepository;
    
    public static class BankReq {
        public String bankCode;
        public String accountNo; // bank_code만 쓰려면 생략 가능
      }

    /** 로그인 사용자의 id(이메일)를 문자열 키(ownerId)로 반환 */
    private String ownerKey(Principal principal) {
        if (principal == null) {
            throw new AccessDeniedException("AUTH_USER_NOT_FOUND");
        }
        return principal.getName();
    }

    /** 목록 */
    @GetMapping
    public Page<SettlementSummaryResponse> list(
            Principal principal,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "status", required = false) Status status, // READY/REQUESTED/APPROVED/PAID/CANCELED
            @RequestParam(name = "from", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(name = "to", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return settlementService.list(ownerKey(principal), from, to, status, page, size);
    }

    /** 상세 */
    @GetMapping("/{id}")
    public SettlementDetailResponse detail(
            Principal principal,
            @PathVariable(name = "id") Long id
    ) {
        return settlementService.getDetail(ownerKey(principal), id);
    }

    /** 요약 카드 */
    @GetMapping("/summary")
    public SettlementSummaryCardResponse summary(
            Principal principal,
            @RequestParam(name = "from", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(name = "to", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return settlementService.summaryCard(ownerKey(principal), from, to);
    }

    /** 월 동기화 (yyyy-MM) */
    @PostMapping("/sync")
    public int syncMonthly(
            Principal principal,
            @RequestParam(name = "ym")
            @DateTimeFormat(pattern = "yyyy-MM") YearMonth ym
    ) {
        return settlementService.syncMonthly(ownerKey(principal), ym);
    }
    
    @PostMapping("/batch/request")
    public void requestBatch(
            Principal principal,
            @RequestParam("ym") @DateTimeFormat(pattern = "yyyy-MM") YearMonth ym,
            @RequestBody(required = false) BankReq req
    ) {
        String ownerId = ownerKey(principal); // idNum 문자열로 통일
        String bankCode = (req == null ? null : req.bankCode);
        String accountNo = (req == null ? null : req.accountNo);
        settlementService.requestPayoutBatch(ownerId, ym, bankCode, accountNo);
    }

}