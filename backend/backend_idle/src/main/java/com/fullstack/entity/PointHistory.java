package com.fullstack.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "point_history")
public class PointHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id_num", nullable = false)
    private CustomerEntity customer;

    @Column(nullable = false)
    private String transactionType; // "CHARGE" 또는 "USE"

    @Column(nullable = false)
    private Integer amount; // 변경된 포인트 양 (+ 또는 -)

    @Column(nullable = false)
    private Integer balanceAfter; // 거래 후 잔액

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime transactionDate;

    private String description; // 거래 설명
}
