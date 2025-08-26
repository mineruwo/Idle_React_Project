package com.fullstack.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "settlement_batch",
    uniqueConstraints = @UniqueConstraint(name = "ux_batch_owner_month", columnNames = {"owner_id", "month_key"}),
    indexes = { @Index(name = "ix_batch_status", columnList = "status") }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarOwnerSettlementBatch {

    public enum Status { REQUESTED, APPROVED, PAID, CANCELED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="owner_id", nullable=false, length=50)
    private String ownerId;

    /** 해당 월의 첫날 (예: 2025-08-01) */
    @Column(name="month_key", nullable=false)
    private LocalDate monthKey;

    /** 아이템 합계 캐시 */
    @Column(name="total_amount", nullable=false)
    private Long totalAmount;

    /** 아이템 수 캐시 */
    @Column(name="item_count", nullable=false)
    private Integer itemCount;

    @Enumerated(EnumType.STRING)
    @Column(name="status", nullable=false, length=20)
    private Status status;

    @Column(name="requested_at", nullable=false)
    private LocalDateTime requestedAt;

    @Column(name="approved_at")
    private LocalDateTime approvedAt;

    @Column(name="paid_at")
    private LocalDateTime paidAt;

    @OneToMany(mappedBy = "batch", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CarOwnerSettlement> items;

    @PrePersist
    void prePersist() {
        if (requestedAt == null) requestedAt = LocalDateTime.now();
        if (status == null) status = Status.REQUESTED;
        if (totalAmount == null) totalAmount = 0L;
        if (itemCount == null) itemCount = 0;
    }
}