package com.fullstack.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fullstack.entity.CustomerEntity;
import com.fullstack.entity.Order;
import com.fullstack.entity.PaymentEntity;
import com.fullstack.entity.PointHistory;
import com.fullstack.model.PaymentRequestDTO;
import com.fullstack.model.PaymentResponseDTO;
import com.fullstack.model.PaymentVerificationDTO;
import com.fullstack.model.PointUsageRequestDTO;
import com.fullstack.repository.CustomerRepository;
import com.fullstack.repository.PaymentRepository;
import com.fullstack.repository.PointHistoryRepository;
import com.fullstack.repository.OrderRepository;
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
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final CustomerRepository customerRepository;
    private final PointHistoryRepository pointHistoryRepository;
    private final OrderRepository orderRepository;

    @Value("${portone.api.key}")
    private String portoneApiKey;

    @Value("${portone.api.secret}")
    private String portoneApiSecret;

    private IamportClient iamportClient;

    @PostConstruct
    public void init() {
        this.iamportClient = new IamportClient(portoneApiKey, portoneApiSecret);
    }

    @Override
    @Transactional
    public PaymentResponseDTO preparePayment(PaymentRequestDTO requestDto) {
        Optional<PaymentEntity> existingPayment = paymentRepository.findByMerchantUid(requestDto.getMerchantUid());
        if (existingPayment.isPresent()) {
            return new PaymentResponseDTO(false, "이미 요청된 주문번호입니다.", null, requestDto.getMerchantUid(), null, null,
                    null, null);
        }

        PaymentEntity paymentEntity = new PaymentEntity();
        paymentEntity.setMerchantUid(requestDto.getMerchantUid());
        paymentEntity.setItemName(requestDto.getItemName());
        paymentEntity.setAmount(requestDto.getAmount());
        paymentEntity.setBuyerName(requestDto.getBuyerName());
        paymentEntity.setBuyerEmail(requestDto.getBuyerEmail());
        paymentEntity.setPaymentStatus("READY"); // 결제 준비 상태
        paymentEntity.setRequestedAt(LocalDateTime.now());
        
        log.info("preparePayment: Request userId: {}", requestDto.getUserId());
        CustomerEntity customer = customerRepository.findById(requestDto.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + requestDto.getUserId()));
        paymentEntity.setCustomer(customer);
        paymentEntity.setPointsUsed(requestDto.getPointsToUse());
        paymentEntity.setPgProvider(requestDto.getPgProvider());
        log.info("preparePayment: PaymentEntity customer ID set to: {}", paymentEntity.getCustomer().getIdNum());
        log.info("preparePayment: PaymentEntity PointsToUse set to: {}", paymentEntity.getPointsUsed());

        paymentRepository.save(paymentEntity);

        PaymentResponseDTO responseDto = new PaymentResponseDTO();
        responseDto.setSuccess(true);
        responseDto.setMessage("결제 요청 정보가 성공적으로 저장되었습니다.");
        responseDto.setMerchantUid(paymentEntity.getMerchantUid());
        responseDto.setAmount(paymentEntity.getAmount().longValue());
        responseDto.setPaymentStatus(paymentEntity.getPaymentStatus());
        return responseDto;
    }

    @Override
    @Transactional
    public PaymentResponseDTO verifyPayment(PaymentVerificationDTO verificationDto) {
        String impUid = verificationDto.getImpUid();
        String merchantUid = verificationDto.getMerchantUid();

        PaymentResponseDTO responseDto = new PaymentResponseDTO();
        responseDto.setMerchantUid(merchantUid);
        responseDto.setImpUid(impUid);

        Optional<PaymentEntity> optionalPayment = paymentRepository.findByMerchantUid(merchantUid);
        if (optionalPayment.isEmpty()) {
            responseDto.setSuccess(false);
            responseDto.setMessage("주문 정보를 찾을 수 없습니다.");
            responseDto.setPaymentStatus("FAILED");
            return responseDto;
        }

        PaymentEntity storedPayment = optionalPayment.get();

        try {
            IamportResponse<Payment> portoneResponse = iamportClient.paymentByImpUid(impUid);
            Payment portonePaymentData = portoneResponse.getResponse();

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

            storedPayment.setImpUid(impUid);
            storedPayment.setPaymentStatus("PAID");
            storedPayment.setPaidAt(LocalDateTime.now());
            paymentRepository.save(storedPayment);

            if (storedPayment.getPointsUsed() != null && storedPayment.getPointsUsed() > 0) {
                if (storedPayment.getCustomer() == null) {
                    log.error("verifyPayment: Customer entity is null for merchantUid: {}", merchantUid);
                } else {
                    log.info("verifyPayment: Calling usePoints for userId: {} with points: {}", storedPayment.getCustomer().getIdNum(), storedPayment.getPointsUsed());
                    PointUsageRequestDTO pointUsageRequest = new PointUsageRequestDTO();
                    pointUsageRequest.setUserId(storedPayment.getCustomer().getIdNum());
                    pointUsageRequest.setPoints(storedPayment.getPointsUsed());
                    usePoints(pointUsageRequest);
                    log.info("verifyPayment: usePoints method called successfully.");
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

    @Override
    @Transactional
    public PaymentResponseDTO verifyAndChargePoints(PaymentVerificationDTO verificationDto) {
        String impUid = verificationDto.getImpUid();
        String merchantUid = verificationDto.getMerchantUid();

        PaymentResponseDTO responseDto = new PaymentResponseDTO();
        responseDto.setMerchantUid(merchantUid);
        responseDto.setImpUid(impUid);

        Optional<PaymentEntity> optionalPayment = paymentRepository.findByMerchantUid(merchantUid);
        if (optionalPayment.isEmpty()) {
            responseDto.setSuccess(false);
            responseDto.setMessage("주문 정보를 찾을 수 없습니다.");
            responseDto.setPaymentStatus("FAILED");
            return responseDto;
        }

        PaymentEntity storedPayment = optionalPayment.get();

        try {
            IamportResponse<Payment> portoneResponse = iamportClient.paymentByImpUid(impUid);
            Payment portonePaymentData = portoneResponse.getResponse();

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

            storedPayment.setImpUid(impUid);
            storedPayment.setPaymentStatus("PAID");
            storedPayment.setPaidAt(LocalDateTime.now());
            paymentRepository.save(storedPayment);

            // 포인트 충전 로직
            if ("포인트 충전".equals(storedPayment.getItemName())) {
                if (storedPayment.getCustomer() == null) {
                    log.error("verifyAndChargePoints: Customer entity is null for merchantUid: {}", merchantUid);
                } else {
                    log.info("verifyAndChargePoints: Calling addPoints for userId: {} with amount: {}", storedPayment.getCustomer().getIdNum(), storedPayment.getAmount().intValue());
                    addPoints(storedPayment.getCustomer().getIdNum(), storedPayment.getAmount().intValue());
                    log.info("verifyAndChargePoints: addPoints method called successfully.");
                }
            } else {
                log.warn("verifyAndChargePoints: itemName is not '포인트 충전'. itemName: {}", storedPayment.getItemName());
            }

            responseDto.setSuccess(true);
            responseDto.setMessage("결제가 성공적으로 완료되고 포인트가 충전되었습니다.");
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

    @Override
    @Transactional
    public void usePoints(PointUsageRequestDTO requestDto) {
        log.info("Entering usePoints method for userId: {} with points: {}", requestDto.getUserId(), requestDto.getPoints());
        CustomerEntity customer = customerRepository.findById(requestDto.getUserId())
                .orElseThrow(() -> {
                    log.error("사용자를 찾을 수 없습니다: {}", requestDto.getUserId());
                    return new IllegalArgumentException("사용자를 찾을 수 없습니다: " + requestDto.getUserId());
                });
        log.info("usePoints: Found customer with ID: {} and current points: {}", customer.getIdNum(), customer.getUserPoint());

        int pointsToUse = requestDto.getPoints();
        if (customer.getUserPoint() < pointsToUse) {
            log.error("포인트가 부족합니다. 현재 포인트: {}, 사용 요청 포인트: {}", customer.getUserPoint(), pointsToUse);
            throw new IllegalStateException("포인트가 부족합니다.");
        }

        log.info("usePoints: Before point deduction, customer {} points: {}", customer.getIdNum(), customer.getUserPoint());
        int newBalance = customer.getUserPoint() - pointsToUse;
        customer.setUserPoint(newBalance);
        customerRepository.save(customer);
        log.info("usePoints: After point deduction and save, customer {} new balance: {}", customer.getIdNum(), customer.getUserPoint());

        PointHistory history = PointHistory.builder()
                .customer(customer)
                .transactionType("USE")
                .amount(-pointsToUse)
                .balanceAfter(newBalance)
                .description("상품 구매")
                .build();
        log.info("usePoints: PointHistory object created: {}", history);
        pointHistoryRepository.save(history);
        log.info("포인트 사용 내역 기록 완료: {}", history);
    }

    @Override
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

    @Override
    @Transactional
    public void failPayment(String merchantUid) {
        log.info("failPayment method called for merchantUid: {}", merchantUid);

        if (merchantUid == null || merchantUid.isBlank()) {
            log.warn("failPayment 호출 시 merchantUid가 null이거나 비어있습니다.");
            return;
        }

        Optional<PaymentEntity> optionalPayment = paymentRepository.findByMerchantUid(merchantUid);

        if (optionalPayment.isEmpty()) {
            log.error("failPayment: merchantUid '{}'에 해당하는 결제 정보를 찾을 수 없습니다. 결제 실패 처리를 중단합니다.", merchantUid);
            return;
        }

        PaymentEntity payment = optionalPayment.get();
        log.info("failPayment: PaymentEntity found for merchantUid: {}. Current status: {}", merchantUid, payment.getPaymentStatus());

        if ("READY".equals(payment.getPaymentStatus())) {
            log.info("failPayment: Payment status is READY. Updating status to FAILED for merchantUid: {}", merchantUid);
            payment.setPaymentStatus("FAILED");
            payment.setCancelledAt(LocalDateTime.now());
            paymentRepository.save(payment);
            log.info("failPayment: merchantUid '{}'의 상태를 FAILED로 업데이트하고 cancelledAt을 설정했습니다.", merchantUid);
        } else {
            log.warn("failPayment: merchantUid '{}'의 결제 상태가 'READY'가 아니므로(현재 상태: {}) 변경하지 않습니다.", merchantUid, payment.getPaymentStatus());
        }
    }

    @Override
    @Transactional
    public PaymentResponseDTO processPointOnlyPayment(PointUsageRequestDTO requestDto) {
        Integer userId = requestDto.getUserId();
        Integer orderId = requestDto.getOrderId();
        int pointsToUse = requestDto.getPoints();

        CustomerEntity customer = customerRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId));

        Order order = orderRepository.findById(orderId.longValue())
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다: " + orderId));

        if (order.getDriverPrice() != pointsToUse) {
            throw new IllegalStateException("주문 금액과 사용 포인트가 일치하지 않습니다.");
        }

        if (customer.getUserPoint() < pointsToUse) {
            throw new IllegalStateException("포인트가 부족합니다.");
        }

        // 1. PaymentEntity 생성 및 저장
        PaymentEntity payment = new PaymentEntity();
        payment.setMerchantUid("point_only_" + order.getId() + "_" + System.currentTimeMillis());
        payment.setItemName(order.getCargoType() != null ? order.getCargoType() + " 운송 서비스" : "화물 운송 서비스");
        payment.setAmount(0L);
        payment.setBuyerName(customer.getNickname());
        payment.setBuyerEmail(customer.getId());
        payment.setPaymentStatus("PAID");
        payment.setPaidAt(LocalDateTime.now());
        payment.setCustomer(customer);
        payment.setPointsUsed(pointsToUse);
        payment.setPgProvider("points"); // PG사를 'points'로 명시

        paymentRepository.save(payment);

        // 2. 포인트 차감 및 히스토리 기록
        int newBalance = customer.getUserPoint() - pointsToUse;
        customer.setUserPoint(newBalance);
        customerRepository.save(customer);

        PointHistory history = PointHistory.builder()
                .customer(customer)
                .transactionType("USE")
                .amount(-pointsToUse)
                .balanceAfter(newBalance)
                .description(order.getId() + "번 주문 전액 포인트 결제")
                .build();
        pointHistoryRepository.save(history);

        // 3. 주문 상태 변경
        order.setStatus("READY");
        orderRepository.save(order);

        // 4. PaymentResponseDTO 생성 및 반환
        PaymentResponseDTO responseDto = new PaymentResponseDTO();
        responseDto.setSuccess(true);
        responseDto.setMessage("전액 포인트 결제가 성공적으로 완료되었습니다.");
        responseDto.setMerchantUid(payment.getMerchantUid());
        responseDto.setImpUid(null); // 외부 결제 imp_uid는 없음
        responseDto.setAmount(payment.getAmount());
        responseDto.setPaymentStatus(payment.getPaymentStatus());
        responseDto.setPaidAt(payment.getPaidAt().toString());

        return responseDto;
    }
}
     