package com.fullstack.service;

import com.fullstack.model.PaymentRequestDto;
import com.fullstack.model.PaymentResponseDto;
import com.fullstack.model.PaymentVerificationDto;
import com.fullstack.model.PointUsageRequestDto;

public interface PaymentService {

    PaymentResponseDto preparePayment(PaymentRequestDto requestDto);

    PaymentResponseDto verifyPayment(PaymentVerificationDto verificationDto);

    void usePoints(PointUsageRequestDto requestDto);

    void addPoints(Integer userId, int amount);

    void failPayment(String merchantUid);
}