package com.fullstack.service;

import com.fullstack.entity.CarOwnerSettlementEntity;
import com.fullstack.model.CarOwnerSettlementDTO.SettlementDetailResponse;
import com.fullstack.model.CarOwnerSettlementDTO.SettlementSummaryCardResponse;
import com.fullstack.model.CarOwnerSettlementDTO.SettlementSummaryResponse;
import org.springframework.data.domain.Page;

import java.time.LocalDate;
import java.time.YearMonth;

public interface CarOwnerSettlementService {

    /**
     * 정산 목록 (기간/상태/페이징)
     */
    Page<SettlementSummaryResponse> list(
            String ownerId,
            LocalDate from,   // nullable
            LocalDate to,     // nullable
            CarOwnerSettlementEntity.Status status, // nullable
            int page,
            int size
    );

    /**
     * 정산 상세
     */
    SettlementDetailResponse getDetail(String ownerId, Long settlementId);

    /**
     * (주문 1건 기준) 정산 생성. 이미 존재하면 기존 ID 반환.
     */
    Long createForOrder(String ownerId, Long orderId);

    /**
     * 월 동기화 (완료 주문 → 미존재 정산 자동 생성)
     * @return 생성 건수
     */
    int syncMonthly(String ownerId, YearMonth ym);
    /* payoutBatch 생성*/
    void requestPayoutBatch(String ownerId, YearMonth ym, String bankCode, String accountNo);
    /**
     * 요약 카드 (합계·건수)
     */
    SettlementSummaryCardResponse summaryCard(String ownerId, LocalDate from, LocalDate to);
}