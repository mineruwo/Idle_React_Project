// src/main/java/com/fullstack/model/OfferAssignRequest.java
package com.fullstack.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OfferAssignRequest {
    private Long orderId;      // 어떤 주문에 대한 배정인지
    private Integer driverId;  // 배정할 기사 (customer.ID_NUM)
    private Long price;        // 제안가
    private String memo;       // 메모(선택)
}
