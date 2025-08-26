package com.fullstack.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "settlement",
    indexes = { @Index(name = "ux_settlement_order", columnList = "order_id", unique = true) }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarOwnerSettlement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="owner_id", nullable=false, length=50)
    private String ownerId;

    @Column(name="order_id")
    private Long orderId;

    @Column(name="amount", nullable=false)
    private Long amount;

    // (선택) 단건 상태는 유지하되, 화면/집계는 배치 상태를 우선 사용
    @Column(name="status", length=20)
    private String status;

    @Column(name="memo", length=200)
    private String memo;

    @Column(name="tx_ref", length=100)
    private String txRef;

    @Column(name="created_at")
    private LocalDateTime createdAt;

    @Column(name="updated_at")
    private LocalDateTime updatedAt;

    @Column(name="paid_at")
    private LocalDateTime paidAt;

    @ManyToOne(optional = false)
    @JoinColumn(name="batch_id")
    private CarOwnerSettlementBatch batch;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    @PreUpdate
    void preUpdate() { updatedAt = LocalDateTime.now(); }
}