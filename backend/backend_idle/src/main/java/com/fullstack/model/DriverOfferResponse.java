// com.fullstack.model.DriverOfferResponse
package com.fullstack.model;

import com.fullstack.entity.DriverOffer;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Builder
@NoArgsConstructor @AllArgsConstructor
public class DriverOfferResponse {
    private Long id;
    private Long orderId;
    private Integer driverIdNum;  // CustomerEntity.ID_NUM
    private String driverName;    // 옵션: customer_name or nickname
    private Long price;
    private String memo;
    private String status;
    private LocalDateTime createdAt;

    public static DriverOfferResponse from(DriverOffer o){
        return DriverOfferResponse.builder()
                .id(o.getId())
                .orderId(o.getOrder().getId())
                .driverIdNum(o.getDriver() != null ? o.getDriver().getIdNum() : null)
                .driverName(o.getDriver() != null ? o.getDriver().getCustomName() : null) // 필드명에 맞춰 수정
                .price(o.getPrice())
                .memo(o.getMemo())
                .status(o.getStatus().name())
                .createdAt(o.getCreatedAt())
                .build();
    }
}
