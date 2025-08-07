package com.fullstack.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderDto {

    private Integer proposedPrice;      // 화주 제안가
    private Long driverPrice;           // 기사 제안가
    private Long avgPrice;
    private String packingOptions; // JSON 문자열로 체크된 포장 옵션들

    private String departure;           // 출발지
    private String arrival;             // 도착지
    private double distance;            // 거리

    private String date;                // 등록일 (필요 시)
    private String reservedDate;        // 예약 시간

    private boolean isImmediate;        // 즉시배송 여부
    private String weight;              // 무게
    private String vehicle;             // 차량 종류
    private String cargoType;           // 화물 종류
    private String cargoSize;           // 화물 크기

    private String packingOption;       // 포장 옵션 (ex: "특수포장, 고가화물")

    private String status;              // 상태 (optional: 미배차, 배차완료 등)
}
