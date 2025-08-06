package com.fullstack.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.FetchType;
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
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;
    private String merchantUid; // 상점 주문 번호
    private String itemName;    // 상품명
    private Long amount;  // 결제 금액 (정확한 금액 계산을 위해 BigDecimal 사용)
    private String buyerName;   // 구매자 이름
    private String buyerEmail;  // 구매자 이메일
    private String paymentStatus; // 결제 상태 (예: "READY", "PAID", "FAILED", "CANCELLED")
    private LocalDateTime requestedAt; // 요청 시간
    private LocalDateTime paidAt; // 결제 완료 시간
    private LocalDateTime cancelledAt; // 결제 취소 시간
    private String impUid; // 아임포트(포트원)에서 발급하는 고유 ID (결제 완료 후 저장)
    private Integer pointsUsed; // 사용된 포인트
    private String pgProvider; // PG사 정보 추가

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", referencedColumnName = "ID_NUM")
    private CustomerEntity customer;
	
	
}









