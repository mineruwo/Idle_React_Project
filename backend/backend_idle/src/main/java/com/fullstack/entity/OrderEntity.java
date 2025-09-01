package com.fullstack.entity;

import java.security.SecureRandom;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fullstack.model.enums.OrderStatus;

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
        @Index(name = "idx_orders_order_no", columnList = "order_no", unique = true)
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_no", length = 32, nullable = false, unique = true)
    private String orderNo;

    @Column(name = "proposed_price")
    private Integer proposedPrice;

    @Column(name = "driver_price")
    private Long driverPrice;

    @Column(name = "avg_price")
    private Long avgPrice;

    private String departure;
    private String arrival;

    @Column(name = "distance")
    private Double distance;

    @Column(name = "reserved_date")
    private String reservedDate;

    @Column(name = "is_immediate")
    private Boolean isImmediate;

    private String weight;
    private String vehicle;
    @Column(name = "cargo_type")
    private String cargoType;
    @Column(name = "cargo_size")
    private String cargoSize;

    @Column(name = "packing_option")
    private String packingOption;

	@Enumerated(EnumType.STRING)
	@Builder.Default
	private OrderStatus status = OrderStatus.CREATED;

    @Column(name = "assigned_driver_id")
    private Long assignedDriverId;

    @Column(name = "shipper_id")
    private String shipperId;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Column(name = "departed_at")
    private LocalDateTime departedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @PrePersist
    public void ensureOrderNo() {
        if (this.status == null) {
            this.status = OrderStatus.CREATED;
        }
        if (this.orderNo == null || this.orderNo.isBlank()) {
            this.orderNo = "ODR-" + randomCode(12);
        }
    }

    private static final String CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RND = new SecureRandom();

    private static String randomCode(int len) {
        StringBuilder sb = new StringBuilder(len);
        for (int i = 0; i < len; i++) {
            sb.append(CHARS.charAt(RND.nextInt(CHARS.length())));
        }
        return sb.toString();
    }
}