package com.fullstack.service;

import com.fullstack.model.PaymentRequestDTO;
import com.fullstack.model.PaymentResponseDTO;
import com.fullstack.model.PaymentVerificationDTO;
import com.fullstack.model.PointUsageRequestDTO;

public interface PaymentService {

    PaymentResponseDTO preparePayment(PaymentRequestDTO requestDto);

    PaymentResponseDTO verifyPayment(PaymentVerificationDTO verificationDto);

    PaymentResponseDTO verifyAndChargePoints(PaymentVerificationDTO verificationDto);

    void usePoints(PointUsageRequestDTO requestDto);

    void addPoints(Integer userId, int amount);

    void failPayment(String merchantUid);

    PaymentResponseDTO processPointOnlyPayment(PointUsageRequestDTO requestDto);
}