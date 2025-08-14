package com.fullstack.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class PaymentResponseDto {

	private boolean success;
    private String message;
    private String redirectUrl;
    private String merchantUid;
    private String impUid;
    private Long amount;
    private String paymentStatus;
	
}
