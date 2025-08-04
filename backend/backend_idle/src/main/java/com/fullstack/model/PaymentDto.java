package com.fullstack.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
@Builder
public class PaymentDto {

	private String ORDER_ID;

	private String FK_ORDER_ID;

	private String PAYMENT_RESULT_LOG;

	private Boolean PAYMENT_SUCCESS_STATUS;

	private Long amount;

	private String paid_type;
	
	private String product_type;
	
}
