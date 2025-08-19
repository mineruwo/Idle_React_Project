// com.fullstack.entity.Order.java
package com.fullstack.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer proposedPrice;      // 화주 제안가
    private Long driverPrice;           // 기사 제안가(확정가)
    private Long avgPrice;              // 평균가

    private String departure;           // 출발지
    private String arrival;             // 도착지
    private double distance;            // 거리

    private String reservedDate;        // 예약 시간

    private boolean isImmediate;        // 즉시 배송 여부
    private String weight;              // 무게
    private String vehicle;             // 차량 종류
    private String cargoType;           // 화물 종류
    private String cargoSize;           // 화물 크기

    private String packingOption;       // 포장 옵션 요약 (콤마 문자열)

    @Builder.Default
    private String status = "OPEN";     // 주문 상태: OPEN/ASSIGNED/...

    // ✅ 배정된 기사 ID (뱃지/배정 박스에서 사용)
    @Column(name = "assigned_driver_id")
    private Long assignedDriverId;


    /* 자동 타임스탬프 */
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
