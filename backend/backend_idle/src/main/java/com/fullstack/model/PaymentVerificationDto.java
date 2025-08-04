package com.fullstack.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentVerificationDto {

	private String impUid;      // 포트원 고유 결제 번호
    private String merchantUid; // 상점 고유 주문번호
	
}
