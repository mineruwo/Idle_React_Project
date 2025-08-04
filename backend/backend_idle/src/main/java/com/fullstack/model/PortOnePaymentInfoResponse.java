package com.fullstack.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PortOnePaymentInfoResponse {

	private int code;
    private String message;
    private PortOnePaymentInfoResponseData response;

    @Getter
    @Setter
    public static class PortOnePaymentInfoResponseData {
        private String imp_uid;
        private String merchant_uid;
        private String pay_method;
        private Long amount;
        private String status; // paid, ready, cancelled, failed 등
        // ... 기타 결제 정보
    }
	
}
