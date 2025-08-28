package com.fullstack.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "settlement", uniqueConstraints = @UniqueConstraint(columnNames = { "order_id" })) // 주문당 1개만
@Getter
@Setter
public class CarOwnerSettlement {
    public enum Status {
        READY, REQUESTED, APPROVED, PAID, CANCELED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id")
    private CarOwnerSettlementBatch batch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(name = "owner_id", nullable = false)
    private String ownerId;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal amount; // 주문에서 가져온 금액(예: driverPrice or 정산금액)

    // ✅ 커미션 항목 추가
    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal commission = BigDecimal.ZERO; // 플랫폼 수수료, 기본 0원

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.READY; // 신청 전 기본 READY

    @Column(name = "requested_at")
    private LocalDateTime requestedAt;
    @Column(name = "approved_at")
    private LocalDateTime approvedAt;
    @Column(name = "paid_at")
    private LocalDateTime paidAt;
    
    @Column(name = "bank_code", length = 10)
    private String bankCode;

    @Column(name = "bank_account_no", length = 64)
    private String bankAccountNo;

    // 월 집계키: 주문 완료일 기준 그 달의 1일 (yyyy-MM-01)
    @Column(name = "month_key", nullable = false)
    private LocalDate monthKey;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    void touch() {
        this.updatedAt = LocalDateTime.now();
    }
}