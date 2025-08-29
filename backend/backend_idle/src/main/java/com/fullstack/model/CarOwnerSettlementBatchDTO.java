package com.fullstack.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

public final class CarOwnerSettlementBatchDTO {
    private CarOwnerSettlementBatchDTO() {}

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BatchSyncRequest {
        private String ym; // "YYYY-MM"
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BatchSummaryResponse {
        private Long id;
        private String ownerId;
        private String yearMonth;
        private LocalDate monthKey;
        private BigDecimal totalAmount;
        private BigDecimal totalCommission;
        private BigDecimal netAmount;
        private long readyCount;
        private long requestedCount;
        private long paidCount;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private String status;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BatchDetailResponse {
        private Long id;
        private String ownerId;
        private String yearMonth;
        private LocalDate monthKey;
        private BigDecimal totalAmount;
        private BigDecimal totalCommission;
        private BigDecimal netAmount;
        private long readyCount;
        private long requestedCount;
        private long paidCount;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private List<CarOwnerSettlementDTO.SettlementSummaryResponse> items;
        private String status;
    }
}