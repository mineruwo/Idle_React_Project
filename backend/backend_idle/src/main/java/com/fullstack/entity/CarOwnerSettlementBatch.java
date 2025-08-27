package com.fullstack.entity;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;

import jakarta.persistence.Table;


import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Entity @Table(name = "settlement_batch",
indexes = {@Index(columnList = "owner_id, month_key")})
@Getter @Setter
public class CarOwnerSettlementBatch {
public enum Status { REQUESTED, APPROVED, PAID, CANCELED }

@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id; // 순서대로 발급

@Column(name = "owner_id", nullable = false)
private String ownerId;

// 신청 대상 월(yyyy-MM-01)
@Column(name = "month_key", nullable = false)
private LocalDate monthKey;

@Enumerated(EnumType.STRING) @Column(nullable = false)
private Status status = Status.REQUESTED;

@Column(name = "requested_at", nullable = false) private LocalDateTime requestedAt = LocalDateTime.now();
@Column(name = "approved_at") private LocalDateTime approvedAt;
@Column(name = "paid_at")     private LocalDateTime paidAt;

@Column(name = "total_amount", precision = 18, scale = 2)
private BigDecimal totalAmount;

@Column(name = "item_count")
private Integer itemCount;
}