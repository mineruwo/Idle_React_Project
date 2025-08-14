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
    private Long driverPrice;           // 기사 제안가
    private Long avgPrice;              // 평균가

    private String departure;           // 출발지
    private String arrival;             // 도착지
    private double distance;            // 거리

    // (이전 String date는 더 이상 사용 X. 남겨도 되고 제거해도 됨)
    // private String date;

    private String reservedDate;        // 예약 시간(현 상태 유지)

    private boolean isImmediate;        // 즉시 배송 여부
    private String weight;              // 무게
    private String vehicle;             // 차량 종류
    private String cargoType;           // 화물 종류
    private String cargoSize;           // 화물 크기

    private String packingOption;       // 포장 옵션 요약 (콤마 문자열)
    private String status;              // 주문 상태

    @ManyToOne
    @JoinColumn(name = "transport_auth_id", nullable = true)
    private TransportAuth transportAuth;

    /* ✅ 자동 타임스탬프 */
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;    // 등록 시각 (서버가 자동 기록)

    @UpdateTimestamp
    private LocalDateTime updatedAt;    // 수정 시각
}
