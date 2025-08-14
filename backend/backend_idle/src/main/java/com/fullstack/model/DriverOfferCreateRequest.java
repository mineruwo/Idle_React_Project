// com.fullstack.model.DriverOfferCreateRequest
package com.fullstack.model;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DriverOfferCreateRequest {
    private Long orderId;
    private Long price;
    private String memo;
}
