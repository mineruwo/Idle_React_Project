// src/main/java/com/fullstack/model/DriverOfferResponse.java
package com.fullstack.model;

import com.fullstack.entity.CustomerEntity;
import com.fullstack.entity.DriverOffer;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverOfferResponse {

    private Long id;
    private Long orderId;

    // CustomerEntity의 ID_NUM (정수형)
    private Integer driverIdNum;

    // 화면에 보일 닉네임(=로그인 아이디). 필드명이 다르면 getUsername() 대신 알맞게 변경
    private String driverName;

    private Long price;
    private String memo;
    private String status;
    private LocalDateTime createdAt;

    public static DriverOfferResponse from(DriverOffer o) {
        CustomerEntity drv = o.getDriver();

        return DriverOfferResponse.builder()
                .id(o.getId())
                .orderId(o.getOrder().getId())
                .driverIdNum(drv != null ? drv.getIdNum() : null)
                .driverName(drv != null ? drv.getCustomName() : null) // ✅ 로그인 아이디를 노출
                .price(o.getPrice())
                .memo(o.getMemo())
                .status(o.getStatus().name())
                .createdAt(o.getCreatedAt())
                .build();
    }
}
