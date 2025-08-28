package com.fullstack.entity;

import java.time.LocalDateTime;

import com.fullstack.entity.Order; // Order import 추가

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "payments")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
    private String merchantUid;
    private String itemName;
    private Long amount;
    private String buyerName;
    private String buyerEmail;
    private String paymentStatus;
    private LocalDateTime requestedAt;
    private LocalDateTime paidAt;
    private LocalDateTime cancelledAt;
    private String impUid;
    private Integer pointsUsed;
    private String pgProvider;

    // Order 와의 관계 설정 추가
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", referencedColumnName = "ID_NUM")
    private CustomerEntity customer;
  
	
	
}