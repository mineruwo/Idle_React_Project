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
        // 주문번호로 조회/검색이 많으니 유니크 인덱스 권장
        @Index(name = "idx_orders_order_no", columnList = "order_no", unique = true)
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 주문번호: 영문+숫자, ODR- 접두어 */
    @Column(name = "order_no", length = 40, nullable = false, unique = true)
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

    /** 배정 정보 */
    @Column(name = "assigned_driver_id")
    private Long assignedDriverId;        // BIGINT

    @Column(name = "shipper_id")
    private String shipperId;             // 화주 ID


    /** 타임스탬프 */
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
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

    // 가독성 좋은 문자셋 (0,1,O,I 제외)
    private static final String CODESET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RND = new SecureRandom();

    private static String randomCode(int len) {
        StringBuilder sb = new StringBuilder(len);
        for (int i = 0; i < len; i++) {
            sb.append(CODESET.charAt(RND.nextInt(CODESET.length())));
        }
        return sb.toString();
    }
}
