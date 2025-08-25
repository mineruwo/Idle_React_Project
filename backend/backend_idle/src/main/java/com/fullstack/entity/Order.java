// src/main/java/com/fullstack/entity/Order.java
package com.fullstack.entity;

import java.security.SecureRandom;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fullstack.model.enums.OrderStatus; // Added import

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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


    /** 금액/평균가 */
    @Column(name = "proposed_price")
    private Integer proposedPrice;        // 화주 제안가 (INTEGER)

    @Column(name = "driver_price")
    private Long driverPrice;             // 기사 확정가 (BIGINT)

    @Column(name = "avg_price")
    private Long avgPrice;                // 평균가 (BIGINT)

    /** 경로/거리 */
    private String departure;             // 출발지
    private String arrival;               // 도착지

    @Column(name = "distance")
    private Double distance;              // DOUBLE PRECISION (nullable 가능성 → Double)

    /** 예약/즉시 여부 */
    @Column(name = "reserved_date")
    private String reservedDate;          // VARCHAR

    @Column(name = "is_immediate")
    private Boolean isImmediate;          // BOOLEAN (nullable 가능성 → Boolean)

    /** 화물/차량/포장 */
    private String weight;                // VARCHAR
    private String vehicle;               // VARCHAR
    @Column(name = "cargo_type")
    private String cargoType;             // VARCHAR
    @Column(name = "cargo_size")
    private String cargoSize;             // VARCHAR

    @Column(name = "packing_option")
    private String packingOption;         // VARCHAR (콤마 문자열)

    /** 상태 */
	@Enumerated(EnumType.STRING) // Added annotation
	@Builder.Default
	private OrderStatus status = OrderStatus.CREATED; // Changed type and default value

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

    @Column(name = "shipper_id")
    private String shipperId;             // 화주 ID


    /** 타임스탬프 */
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    /* ===== 주문번호 자동 생성 ===== */
    @PrePersist
    public void ensureOrderNo() {
        // 상태 기본값 보정
        if (this.status == null) { // Check for null directly for enum
            this.status = OrderStatus.CREATED; // Set default to CREATED enum
        }
        // 주문번호 없으면 생성
        if (this.orderNo == null || this.orderNo.isBlank()) {
            this.orderNo = "ODR-" + randomCode(12);   // 총 길이 예: ODR-XXXXXXXXXXXX (16자)
        }
    }

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
