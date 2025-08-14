package com.fullstack.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer proposedPrice;      // 화주 제안가
    private Long driverPrice;           // 기사 제안가
    private Long avgPrice;              // 평균가

    private String departure;           // 출발지
    private String arrival;             // 도착지
    private double distance;            // 거리

    private String date;                // 등록 날짜 (필요 시)
    private String reservedDate;        // 예약 시간

    private boolean isImmediate;        // 즉시 배송 여부
    private String weight;              // 무게
    private String vehicle;             // 차량 종류
    private String cargoType;           // 화물 종류
    private String cargoSize;           // 화물 크기

    private String packingOption;       // 포장 옵션 (콤마 구분 문자열)

    private String status;              // 주문 상태 (예: 대기중, 배차완료 등)

    
}
