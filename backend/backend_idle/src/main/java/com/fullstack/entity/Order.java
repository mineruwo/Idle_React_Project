// src/main/java/com/fullstack/entity/Order.java
package com.fullstack.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "orders",
    indexes = {
        // 주문번호 조회가 많으니 인덱스 + 유니크 권장
        @Index(name = "idx_orders_order_no", columnList = "order_no", unique = true)
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    /* ===================== 기본키 ===================== */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /* ===================== 주문번호 ===================== */
    // 영문/숫자 랜덤, 접두사 ODR-, 날짜 안 붙음 (요구사항 B안)
    @Column(name = "order_no", length = 32, nullable = false, unique = true)
    private String orderNo;

    /* ===================== 금액/상태 ===================== */
    private Integer proposedPrice;      // 화주 제안가
    private Long driverPrice;           // 기사 확정가(입찰 확정 시 저장)
    private Long avgPrice;              // 평균가

    @Builder.Default
    private String status = "OPEN";     // 서버/서비스에서 "등록완료" 등으로 바꿔 저장 가능

    /* ===================== 경로/정보 ===================== */
    private String departure;           // 출발지
    private String arrival;             // 도착지
    private double distance;            // 거리(km 등)

    private String reservedDate;        // 예약 시간(문자열 보관 중이면 그대로 둠)

    // ⚠️ 서비스에서 dto.isImmediate()를 호출하므로 필드명은 isImmediate 그대로 유지
    private boolean isImmediate;        // 즉시 여부

    private String weight;              // 무게
    private String vehicle;             // 차량 종류
    private String cargoType;           // 화물 종류
    private String cargoSize;           // 화물 크기
    private String packingOption;       // 포장 옵션(콤마 문자열/요약)

    /* ===================== 배정 정보 ===================== */
    // 배정된 기사 ID (없으면 null)
    @Column(name = "assigned_driver_id")
    private Long assignedDriverId;

    /* ===================== 타임스탬프 ===================== */
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    /* ====================================================
       아래부터는 주문번호 자동 생성(날짜 미포함) 유틸/후크
       - 엔티티에만 두면 DTO/서비스 수정 없이 동작
       - DB에 order_no UNIQUE 인덱스가 있으면 중복도 방지됨
       ==================================================== */

    // 가독성 좋은 문자셋 (0/O, 1/I 제외)
    private static final String CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RND = new SecureRandom();

    private static String randomCode(int len) {
        StringBuilder sb = new StringBuilder(len);
        for (int i = 0; i < len; i++) {
            sb.append(CHARS.charAt(RND.nextInt(CHARS.length())));
        }
        return sb.toString();
    }

    // INSERT 직전(order_no가 비어 있으면) 자동 생성
    @PrePersist
    public void ensureOrderNo() {
        if (this.orderNo == null || this.orderNo.isBlank()) {
            // ODR- + 10자리(필요 시 길이 조절)
            this.orderNo = "ODR-" + randomCode(10);
        }
    }

}
