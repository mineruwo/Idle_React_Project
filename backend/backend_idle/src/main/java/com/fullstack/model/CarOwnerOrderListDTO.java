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

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class OrderSummaryResponse {
        private Long id;
        private String status;     // READY/ONGOING/COMPLETED/CANCELED
        private String route;      // "출발지→도착지"
        private String cargoType;
        private Long price;        // 확정가(driverPrice) 있으면 그 값, 없으면 proposedPrice
        private LocalDateTime updatedAt;
        private String departure;   // 출발지
        private String arrival;     // 도착지
        private String s_date; 
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class OrderDetailResponse {
        private Long id;
        private Long assignedDriverId;
        private String status;

        private String departure;
        private String arrival;
        private Double distance;

        private String reservedDate;
        private Boolean immediate;
        private String weight;
        private String vehicle;
        private String cargoType;
        private String cargoSize;
        private String packingOption;

        private Integer proposedPrice;
        private Long driverPrice;
        private Long avgPrice;

        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class OrderCreateRequest {
        private String departure;
        private String arrival;
        private double distance;
        private String reservedDate;
        private boolean immediate;
        private String weight;
        private String vehicle;
        private String cargoType;
        private String cargoSize;
        private String packingOption;
        private Integer proposedPrice; // 화주 제안가
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class OrderUpdateRequest {
        private String departure;
        private String arrival;
        private Double distance;
        private String reservedDate;
        private Boolean immediate;
        private String weight;
        private String vehicle;
        private String cargoType;
        private String cargoSize;
        private String packingOption;
        private Integer proposedPrice;
        private Long driverPrice;
    }
}