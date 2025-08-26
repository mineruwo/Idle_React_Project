package com.fullstack.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

public final class CarOwnerSettlementDTO {
    private CarOwnerSettlementDTO(){}

    // 생성(수동 추가가 필요할 때만 사용; 월 자동 동기화와 병행 가능)
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SettlementCreate {
        private Long orderId;
        private Long amount;
        private String memo;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SettlementMemoRequest {
        private String memo;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SettlementPayRequest {
        private String txRef;
    }

    // 목록 행 (프론트 fetchSettlements 반환값: Page<SettlementSummaryResponse>)
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SettlementSummaryResponse {
        private Long id;           // item id
        private Long orderId;
        private Long amount;
        private String status;     // 배치 상태를 내려줌(REQUESTED/APPROVED/PAID/CANCELED)
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime requestedAt; // 배치 요청 시각
    }

    // 단건 상세
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SettlementDetailResponse {
        private Long id;
        private String ownerId;
        private Long orderId;
        private Long amount;
        private String status;     // 배치 상태
        private String memo;
        private String txRef;
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime requestedAt;
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime paidAt;
    }

    // 요약 카드 (/summary)
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SettlementSummaryCardResponse {
        private long todayEarnings;
        private long monthEarnings;
        private long unsettledAmount;
        private LocalDate month;   // 2025-08-01 (월 첫날)
    }
}