package com.fullstack.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 정산(Settlement) 관련 DTO 묶음
 * 사용: SettlementDTO.CarOwnerSettlementDTO, SettlementDTO.SettlementDetailResponse 등
 */
public final class CarOwnerSettlementDTO {

    private CarOwnerSettlementDTO() {} // 인스턴스화 방지

    // 생성/요청 DTO
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SettlementCreate {
        @NotNull
        private Long orderId;
        @NotNull @Min(0)
        private Integer amount;          // 정산 금액(원)
        @Size(max = 200)
        private String memo;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SettlementMemoRequest {
        @Size(max = 200)
        private String memo;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SettlementPayRequest {
        @Size(max = 100)
        private String txRef;            // 이체 참고값(선택)
    }

    // 목록용 요약
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SettlementSummaryResponse {
        private Long id;
        private Long orderId;
        private Integer amount;
        private String status; // REQUESTED/APPROVED/PAID/CANCELED
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime createdAt;
    }

    // 단건 상세
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SettlementDetailResponse {
        private Long id;
        private String ownerId;
        private Long orderId;
        private Integer amount;
        private String status;
        private String memo;
        private String txRef;
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime createdAt;
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime updatedAt;
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime paidAt;
    }

    // 대시보드 카드 요약
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SettlementSummaryCardResponse {
        private long todayEarnings;
        private long monthEarnings;
        private long unsettledAmount;
        private LocalDate month; // 기준 월 (예: 2025-08-01 형태로 월 키)
    }
}