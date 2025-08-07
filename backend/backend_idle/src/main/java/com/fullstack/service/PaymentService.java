package com.fullstack.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fullstack.entity.CustomerEntity;
import com.fullstack.entity.PaymentEntity;
import com.fullstack.entity.PointHistory;
import com.fullstack.model.PaymentRequestDto;
import com.fullstack.model.PaymentResponseDto;
import com.fullstack.model.PaymentVerificationDto;
import com.fullstack.model.PointUsageRequestDto;
import com.fullstack.repository.CustomerRepository;
import com.fullstack.repository.PaymentRepository;
import com.fullstack.repository.PointHistoryRepository;
import com.siot.IamportRestClient.IamportClient;
import com.siot.IamportRestClient.exception.IamportResponseException;
import com.siot.IamportRestClient.response.IamportResponse;
import com.siot.IamportRestClient.response.Payment;

import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RequiredArgsConstructor
@Service
@Log4j2
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final CustomerRepository customerRepository;
    private final PointHistoryRepository pointHistoryRepository;

    @Value("${portone.api.key}")
    private String portoneApiKey;

    @Value("${portone.api.secret}")
    private String portoneApiSecret;

    private IamportClient iamportClient;

    @PostConstruct
    public void init() {
        this.iamportClient = new IamportClient(portoneApiKey, portoneApiSecret);
    }

    // 결제 요청 정보 저장 (프론트에서 결제창 띄우기 전 호출)
    @Transactional
    public PaymentResponseDto preparePayment(PaymentRequestDto requestDto) {
        // 이미 존재하는 merchant_uid인지 확인 (옵션)
        Optional<PaymentEntity> existingPayment = paymentRepository.findByMerchantUid(requestDto.getMerchantUid());
        if (existingPayment.isPresent()) {
            // 이미 결제 요청된 주문번호라면 에러 처리 또는 기존 정보 업데이트
            return new PaymentResponseDto(false, "이미 요청된 주문번호입니다.", null, requestDto.getMerchantUid(), null, null,
                    null);
        }

        PaymentEntity paymentEntity = new PaymentEntity();
        paymentEntity.setMerchantUid(requestDto.getMerchantUid());
        paymentEntity.setItemName(requestDto.getItemName());
        paymentEntity.setAmount(requestDto.getAmount());
        paymentEntity.setBuyerName(requestDto.getBuyerName());
        paymentEntity.setBuyerEmail(requestDto.getBuyerEmail());
        paymentEntity.setPaymentStatus("READY"); // 결제 준비 상태
        paymentEntity.setRequestedAt(LocalDateTime.now());
        
        // 사용자 정보 설정
        log.info("preparePayment: Request userId: {}", requestDto.getUserId());
        CustomerEntity customer = customerRepository.findById(requestDto.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + requestDto.getUserId()));
        paymentEntity.setCustomer(customer);
        paymentEntity.setPointsUsed(requestDto.getPointsToUse()); // 사용된 포인트 저장
        paymentEntity.setPgProvider(requestDto.getPgProvider()); // PG사 정보 저장
        log.info("preparePayment: PaymentEntity customer ID set to: {}", paymentEntity.getCustomer().getIdNum());

        paymentRepository.save(paymentEntity);

        PaymentResponseDto responseDto = new PaymentResponseDto();
        responseDto.setSuccess(true);
        responseDto.setMessage("결제 요청 정보가 성공적으로 저장되었습니다.");
        responseDto.setMerchantUid(paymentEntity.getMerchantUid());
        responseDto.setAmount(paymentEntity.getAmount().longValue());
        responseDto.setPaymentStatus(paymentEntity.getPaymentStatus());
        return responseDto;
    }

    // 결제 검증 (프론트에서 결제 완료 후 호출)
    @Transactional
    public PaymentResponseDto verifyPayment(PaymentVerificationDto verificationDto) {
        String impUid = verificationDto.getImpUid();
        String merchantUid = verificationDto.getMerchantUid();

        PaymentResponseDto responseDto = new PaymentResponseDto();
        responseDto.setMerchantUid(merchantUid);
        responseDto.setImpUid(impUid);

        // 1. DB에서 주문 정보 조회
        Optional<PaymentEntity> optionalPayment = paymentRepository.findByMerchantUid(merchantUid);
        if (optionalPayment.isEmpty()) {
            responseDto.setSuccess(false);
            responseDto.setMessage("주문 정보를 찾을 수 없습니다.");
            responseDto.setPaymentStatus("FAILED");
            return responseDto;
        }

        PaymentEntity storedPayment = optionalPayment.get();

        try {
            // 2. 포트원에서 결제 정보 조회
            IamportResponse<Payment> portoneResponse = iamportClient.paymentByImpUid(impUid);
            Payment portonePaymentData = portoneResponse.getResponse();

            // 3. 결제 금액 및 상태 검증
            if (storedPayment.getAmount().longValue() != portonePaymentData.getAmount().longValue()) {
                responseDto.setSuccess(false);
                responseDto.setMessage("결제 금액이 일치하지 않습니다. 위조된 결제 시도.");
                storedPayment.setPaymentStatus("FAILED");
                paymentRepository.save(storedPayment);
                log.warn("결제 금액 불일치: DB 금액 {}, 포트원 금액 {}", storedPayment.getAmount(), portonePaymentData.getAmount());
                return responseDto;
            }

            if (!"paid".equals(portonePaymentData.getStatus())) {
                responseDto.setSuccess(false);
                responseDto.setMessage("결제가 완료되지 않았습니다. 현재 상태: " + portonePaymentData.getStatus());
                storedPayment.setPaymentStatus(portonePaymentData.getStatus().toUpperCase());
                paymentRepository.save(storedPayment);
                return responseDto;
            }

            // 4. 모든 검증 성공 시 DB 업데이트
            storedPayment.setImpUid(impUid);
            storedPayment.setPaymentStatus("PAID");
            storedPayment.setPaidAt(LocalDateTime.now());
            paymentRepository.save(storedPayment);

            // 포인트 사용 로직 호출
            if (storedPayment.getPointsUsed() != null && storedPayment.getPointsUsed() > 0) {
                if (storedPayment.getCustomer() == null) {
                    log.error("verifyPayment: Customer entity is null for merchantUid: {}", merchantUid);
                    // 여기서 더 이상 진행하지 않고, 필요하다면 오류 응답을 반환하거나 다른 처리를 할 수 있습니다.
                    // 현재는 NullPointerException을 방지하고 로그를 남기는 데 집중합니다.
                } else {
                    log.info("verifyPayment: Calling usePoints for userId: {} with points: {}", storedPayment.getCustomer().getIdNum(), storedPayment.getPointsUsed());
                    PointUsageRequestDto pointUsageRequest = new PointUsageRequestDto();
                    pointUsageRequest.setUserId(storedPayment.getCustomer().getIdNum()); // 이 부분을 다시 수정
                    pointUsageRequest.setPoints(storedPayment.getPointsUsed());
                    usePoints(pointUsageRequest);
                    log.info("verifyPayment: usePoints method called successfully.");
                }
            }

            // 새로운 포인트 충전 로직 추가: 결제 금액이 있고, 사용된 포인트가 없거나 0인 경우 (포인트 충전으로 간주)
            if (storedPayment.getAmount() != null && storedPayment.getAmount() > 0 &&
                (storedPayment.getPointsUsed() == null || storedPayment.getPointsUsed() == 0)) {
                if (storedPayment.getCustomer() == null) {
                    log.error("verifyPayment: Customer entity is null for merchantUid: {} when trying to add points", merchantUid);
                } else {
                    log.info("verifyPayment: Calling addPoints for userId: {} with amount: {}", storedPayment.getCustomer().getIdNum(), storedPayment.getAmount());
                    addPoints(storedPayment.getCustomer().getIdNum(), storedPayment.getAmount().intValue());
                    log.info("verifyPayment: addPoints method called successfully.");
                }
            }

            responseDto.setSuccess(true);
            responseDto.setMessage("결제가 성공적으로 완료되었습니다.");
            responseDto.setAmount(storedPayment.getAmount());
            responseDto.setPaymentStatus(storedPayment.getPaymentStatus());

            return responseDto;

        } catch (IamportResponseException e) {
            log.error("PortOne API 오류: {}", e.getMessage());
            responseDto.setSuccess(false);
            responseDto.setMessage("결제 검증 중 오류가 발생했습니다. (API 통신 에러)");
            storedPayment.setPaymentStatus("FAILED");
            paymentRepository.save(storedPayment);
            return responseDto;
        } catch (IOException e) {
            log.error("PortOne 통신 오류: {}", e.getMessage());
            responseDto.setSuccess(false);
            responseDto.setMessage("결제 검증 중 오류가 발생했습니다. (통신 에러)");
            storedPayment.setPaymentStatus("FAILED");
            paymentRepository.save(storedPayment);
            return responseDto;
        }
    }

    // 포인트 사용 로직
    @Transactional
    public void usePoints(PointUsageRequestDto requestDto) {
        log.info("Entering usePoints method for userId: {} with points: {}", requestDto.getUserId(), requestDto.getPoints());
        // 1. 사용자 조회
        CustomerEntity customer = customerRepository.findById(requestDto.getUserId())
                .orElseThrow(() -> {
                    log.error("사용자를 찾을 수 없습니다: {}", requestDto.getUserId());
                    return new IllegalArgumentException("사용자를 찾을 수 없습니다: " + requestDto.getUserId());
                });
        log.info("usePoints: Found customer with ID: {} and current points: {}", customer.getIdNum(), customer.getUserPoint());

        // 2. 포인트 검증
        int pointsToUse = requestDto.getPoints();
        if (customer.getUserPoint() < pointsToUse) {
            log.error("포인트가 부족합니다. 현재 포인트: {}, 사용 요청 포인트: {}", customer.getUserPoint(), pointsToUse);
            throw new IllegalStateException("포인트가 부족합니다.");
        }

        // 3. 사용자 포인트 차감
        log.info("usePoints: Before point deduction, customer {} points: {}", customer.getIdNum(), customer.getUserPoint());
        int newBalance = customer.getUserPoint() - pointsToUse;
        customer.setUserPoint(newBalance);
        customerRepository.save(customer);
        log.info("usePoints: After point deduction and save, customer {} new balance: {}", customer.getIdNum(), customer.getUserPoint());

        // 4. 포인트 사용 내역 기록
        PointHistory history = PointHistory.builder()
                .customer(customer)
                .transactionType("USE")
                .amount(-pointsToUse)
                .balanceAfter(newBalance)
                .description("상품 구매") // 설명은 필요에 따라 변경
                .build();
        log.info("usePoints: PointHistory object created: {}", history);
        pointHistoryRepository.save(history);
        log.info("포인트 사용 내역 기록 완료: {}", history);
    }

    // 포인트 충전 로직
    @Transactional
    public void addPoints(Integer userId, int amount) {
        log.info("Entering addPoints method for userId: {} with amount: {}", userId, amount);
        CustomerEntity customer = customerRepository.findById(userId)
                .orElseThrow(() -> {
                    log.error("사용자를 찾을 수 없습니다: {}", userId);
                    return new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId);
                });
        log.info("addPoints: Found customer with ID: {} and current points: {}", customer.getIdNum(), customer.getUserPoint());

        log.info("addPoints: Before point addition, customer {} points: {}", customer.getIdNum(), customer.getUserPoint());
        int newBalance = customer.getUserPoint() + amount;
        customer.setUserPoint(newBalance);
        log.info("addPoints: After setting new balance, customer {} points (in memory): {}", customer.getIdNum(), customer.getUserPoint());
        customerRepository.save(customer);
        log.info("addPoints: After save, customer {} new balance (from saved entity): {}", customer.getIdNum(), customer.getUserPoint());

        PointHistory history = PointHistory.builder()
                .customer(customer)
                .transactionType("CHARGE")
                .amount(amount)
                .balanceAfter(newBalance)
                .description("포인트 충전")
                .build();
        log.info("addPoints: PointHistory object created: {}", history);
        pointHistoryRepository.save(history);
        log.info("포인트 충전 내역 기록 완료: {}", history);
    }
}

