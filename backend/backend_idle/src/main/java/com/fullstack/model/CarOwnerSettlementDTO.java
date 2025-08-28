package com.fullstack.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

public final class CarOwnerSettlementDTO {
    private CarOwnerSettlementDTO() {}

    /* =========================
     * 요청 DTO
     * ========================= */

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SettlementCreate {
        private Long orderId;
        private BigDecimal amount;
        private String memo;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SettlementMemoRequest {
        private String memo;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SettlementPayRequest {
        private String txRef;
    }

    /* =========================
     * 응답 DTO - 목록 행
     * ========================= */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SettlementSummaryResponse {
        private Long id;
        private Long orderId;
        private String orderNo;
        private String departure;
        private String arrival;
        private BigDecimal amount;
        private BigDecimal commission;
        private BigDecimal netAmount;
        private String status;
        private LocalDateTime createdAt;
        private LocalDateTime paidAt;
        private LocalDate monthKey;
    }

    /* =========================
     * 응답 DTO - 상세
     * ========================= */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SettlementDetailResponse {
        private Long id;
        private String ownerId;
        private Long orderId;
        private String orderNo;
        private String departure;
        private String arrival;
        private BigDecimal amount;
        private BigDecimal commission;
        private BigDecimal netAmount;
        private String status;
        private LocalDateTime requestedAt;
        private LocalDateTime approvedAt;
        private LocalDateTime paidAt;
        private LocalDate monthKey;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private String txRef;
        private Long batchId;
    }

    /* =========================
     * 응답 DTO - 요약 카드
     * ========================= */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SettlementSummaryCardResponse {
        private String period;
        private BigDecimal totalAmount;
        private BigDecimal totalCommission;
        private BigDecimal netAmount;
        private long readyCount;
        private long requestedCount;
        private long paidCount;
    }
}
