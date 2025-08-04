package com.fullstack.service;

import com.fullstack.repository.PaymentRepository;
import org.springframework.stereotype.Service;

import com.siot.IamportRestClient.IamportClient;

@Service
public class PaymentService {

	private final IamportClient iamportClient;
    private final PaymentRepository paymentRepository;

    public PaymentService(PaymentRepository paymentRepository) {
        // 포트원 토큰 발급을 위해 API 키 입력
       this.iamportClient = new IamportClient("REST_API_KEY",
                "REST_API_SECRET");
        this.paymentRepository = paymentRepository;
    }
	
}
