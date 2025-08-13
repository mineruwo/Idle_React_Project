package com.fullstack.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * 차량(Vehicle) 관련 DTO 묶음
 * 사용: VehicleDTO.VehicleCreateRequest, VehicleDTO.VehicleDetailResponse 등
 */
public final class CarOwnerVehiclesDTO {

    private CarOwnerVehiclesDTO() {} // 인스턴스화 방지

    @Getter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class VehicleCreateRequest {
        @NotBlank @Size(max = 20)
        private String plateNumber;
        @NotBlank @Size(max = 30)
        
        private String type;      // 예: "8t 트럭"
        @Size(max = 30)
        private String model;
        private Integer capacity; // 단위는 팀 규칙(kg/ton)
        private boolean primary;  // 등록 시 기본차량 설정 여부
    }

    @Getter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class VehicleUpdateRequest {
        @Size(max = 30)
        private String type;
        @Size(max = 30)
        private String model;
        private Integer capacity;
    }

    @Getter @NoArgsConstructor @AllArgsConstructor @Builder@Setter
    public static class VehicleSummaryResponse {
        private Long id;
        private String plateNumber;
        private String type;
        private boolean primary;
        private String status; // ACTIVE/INACTIVE
    }

    @Getter @NoArgsConstructor @AllArgsConstructor @Builder@Setter
    public static class VehicleDetailResponse {
        private Long id;
        private String plateNumber;
        private String type;
        private String model;
        private Integer capacity;
        private boolean primary;
        private String status;
        private LocalDateTime registeredAt;
    }
}