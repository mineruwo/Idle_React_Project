package com.fullstack.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
@Builder
public class PaymentRequestDto {

	private String merchantUid; // 상점 고유 주문번호 (프론트에서 생성하여 넘겨줌)
    private String itemName;
    private Long amount;
    private String buyerName;
    private String buyerEmail;
	
}
