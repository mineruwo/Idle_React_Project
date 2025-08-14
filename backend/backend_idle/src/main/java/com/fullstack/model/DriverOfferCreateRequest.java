package com.fullstack.model;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DriverOfferCreateRequest {
    private Long orderId;
    private Long driverId;
    private Long price;
    private String memo;
}
