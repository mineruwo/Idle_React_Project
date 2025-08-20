package com.fullstack.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 주문 관련 DTO 묶음 클래스
 */
public final class CarOwnerOrderListDTO {

    private CarOwnerOrderListDTO() {} // 외부에서 인스턴스화 방지

    // 주문 생성 요청 DTO
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class OrderCreateRequest {
        @NotBlank private String departure;
        @NotBlank private String arrival;
        @NotBlank private String cargoType;
        @Size(max = 20) private String cargoSize;
        @Size(max = 20) private String weight;
        @Size(max = 30) private String vehicle;
        private boolean immediate;
        private String reservedDate;   // 문자열 정책 유지
        @Size(max = 20) private String distance;
        @Min(0) private Integer proposedPrice;
    }

    // 주문 수정 요청 DTO
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class OrderUpdateRequest {
        private String departure;
        private String arrival;
        private String cargoType;
        private String cargoSize;
        private String weight;
        private String vehicle;
        private Boolean immediate;
        private String reservedDate;
        private String distance;
        private Integer proposedPrice;
    }

    // 주문 요약 응답 DTO
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class OrderSummaryResponse {
        private Long id;
        private String status;     // CREATED/ONGOING/COMPLETED/CANCELED
        private String route;      // "출발→도착"
        private String cargoType;
        private Integer price;     // 확정가/제안가
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime updatedAt;
    }

    // 주문 상세 응답 DTO
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class OrderDetailResponse {
        private Long id;
        private String ownerId;
        private String status;
        private String departure;
        private String arrival;
        private String cargoType;
        private String cargoSize;
        private String weight;
        private String vehicle;
        private boolean immediate;
        private String reservedDate;
        private String distance;

        private Long vehicleId;
        private Integer proposedPrice;
        private Integer finalPrice;

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime createdAt;
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime updatedAt;
    }
}