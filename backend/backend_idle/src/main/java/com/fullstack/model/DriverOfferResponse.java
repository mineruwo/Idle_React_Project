package com.fullstack.model;

import com.fullstack.entity.DriverOffer;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DriverOfferResponse {
    private Long id;
    private Long orderId;
    private Long driverId;
    private Long price;
    private String memo;
    private String status;
    private LocalDateTime createdAt;

    public static DriverOfferResponse from(DriverOffer o){
        return DriverOfferResponse.builder()
                .id(o.getId())
                .orderId(o.getOrder().getId())
                .driverId(o.getDriverId())
                .price(o.getPrice())
                .memo(o.getMemo())
                .status(o.getStatus().name())
                .createdAt(o.getCreatedAt())
                .build();
    }
}
