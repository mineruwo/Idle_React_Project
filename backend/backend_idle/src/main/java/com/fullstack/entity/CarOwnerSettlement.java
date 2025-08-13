package com.fullstack.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "car_owner_settlement",
       indexes = {
           @Index(name = "idx_settlement_owner", columnList = "owner_id"),
           @Index(name = "idx_settlement_order", columnList = "order_id"),
           @Index(name = "idx_settlement_status", columnList = "status")
       })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CarOwnerSettlement {

    public enum Status { REQUESTED, APPROVED, PAID, CANCELED }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="owner_id", nullable=false, length=50)
    private String ownerId;

    @Column(name="order_id", nullable=false)
    private Long orderId;

    @Column(name="amount", nullable=false)
    private Integer amount;

    @Enumerated(EnumType.STRING)
    @Column(name="status", nullable=false, length=20)
    private Status status;

    @Column(name="memo", length=200)
    private String memo;

    @Column(name="tx_ref", length=100)
    private String txRef;

    @Column(name="created_at", nullable=false)
    private LocalDateTime createdAt;

    @Column(name="updated_at", nullable=false)
    private LocalDateTime updatedAt;

    @Column(name="paid_at")
    private LocalDateTime paidAt;

    @Version
    private Long version; // 낙관적 락(동시 업데이트 방지)

    @PrePersist
    void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
        if (status == null) status = Status.REQUESTED;
    }

    @PreUpdate
    void preUpdate() { updatedAt = LocalDateTime.now(); }

    // 상태 전이 헬퍼
    public void approve(String memo) {
        if (status == Status.CANCELED || status == Status.PAID) {
            throw new IllegalStateException("INVALID_STATE_TRANSITION");
        }
        this.status = Status.APPROVED;
        if (memo != null) this.memo = memo;
    }

    public void pay(String txRef) {
        if (status != Status.APPROVED && status != Status.REQUESTED) {
            throw new IllegalStateException("INVALID_STATE_TRANSITION");
        }
        this.status = Status.PAID;
        this.txRef = txRef;
        this.paidAt = LocalDateTime.now();
    }

    public void cancel(String memo) {
        if (status == Status.PAID) {
            throw new IllegalStateException("ALREADY_PAID");
        }
        this.status = Status.CANCELED;
        if (memo != null) this.memo = memo;
    }
}
