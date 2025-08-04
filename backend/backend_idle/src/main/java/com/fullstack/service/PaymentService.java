package com.fullstack.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fullstack.entity.PaymentEntity;
import com.fullstack.model.PaymentRequestDto;
import com.fullstack.model.PaymentResponseDto;
import com.fullstack.model.PaymentVerificationDto;
import com.fullstack.model.PortOneAccessTokenResponse;
import com.fullstack.model.PortOnePaymentInfoResponse;
import com.fullstack.repository.PaymentRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RequiredArgsConstructor
@Service
@Log4j2
public class PaymentService {

	private final PaymentRepository paymentRepository;
	private final RestTemplate restTemplate;
	private final ObjectMapper objectMapper;

	@Value("${portone.api.key}")
	private String portoneApiKey;

	@Value("${portone.api.secret}")
	private String portoneApiSecret;

	private static final String PORTONE_API_BASE_URL = "https://api.iamport.kr";

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

		paymentRepository.save(paymentEntity);

		PaymentResponseDto responseDto = new PaymentResponseDto();
		responseDto.setSuccess(true);
		responseDto.setMessage("결제 요청 정보가 성공적으로 저장되었습니다.");
		responseDto.setMerchantUid(paymentEntity.getMerchantUid());
		responseDto.setAmount(paymentEntity.getAmount().longValue());
		responseDto.setPaymentStatus(paymentEntity.getPaymentStatus());
		return responseDto;
	}

	// 포트원 access_token 발급
	private String getPortOneAccessToken() {
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);

		Map<String, String> body = new HashMap<>();
		body.put("imp_key", portoneApiKey);
		body.put("imp_secret", portoneApiSecret);

		HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);

		try {
			ResponseEntity<PortOneAccessTokenResponse> response = restTemplate
					.postForEntity(PORTONE_API_BASE_URL + "/users/getToken", request, PortOneAccessTokenResponse.class);

			if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null
					&& response.getBody().getResponse() != null) {
				return response.getBody().getResponse().getAccess_token();
			} else {
				log.error("PortOne Access Token 발급 실패: {}", response.getBody());
				throw new RuntimeException("PortOne Access Token 발급 실패");
			}
		} catch (HttpClientErrorException e) {
			log.error("PortOne Access Token 발급 HTTP 에러: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
			throw new RuntimeException("PortOne Access Token 발급 실패: " + e.getMessage());
		} catch (Exception e) {
			log.error("PortOne Access Token 발급 중 예외 발생", e);
			throw new RuntimeException("PortOne Access Token 발급 실패: " + e.getMessage());
		}
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

		// 2. 포트원 Access Token 발급
		String accessToken = getPortOneAccessToken();

		// 3. 포트원에서 결제 정보 조회
		HttpHeaders headers = new HttpHeaders();
		headers.setBearerAuth(accessToken);
		headers.setContentType(MediaType.APPLICATION_JSON); // V2 API는 JSON을 기본으로 함

		HttpEntity<String> requestEntity = new HttpEntity<>(headers);

		try {
			ResponseEntity<PortOnePaymentInfoResponse> portoneResponse = restTemplate.getForEntity(
					PORTONE_API_BASE_URL + "/payments/" + impUid, PortOnePaymentInfoResponse.class, requestEntity // GET

			);

			if (!portoneResponse.getStatusCode().is2xxSuccessful() || portoneResponse.getBody() == null
					|| portoneResponse.getBody().getResponse() == null) {
				log.error("PortOne 결제 정보 조회 실패: {}", portoneResponse.getBody());
				responseDto.setSuccess(false);
				responseDto.setMessage("포트원에서 결제 정보를 조회할 수 없습니다.");
				storedPayment.setPaymentStatus("FAILED");
				paymentRepository.save(storedPayment);
				return responseDto;
			}

			PortOnePaymentInfoResponse.PortOnePaymentInfoResponseData portonePaymentData = portoneResponse.getBody()
					.getResponse();

			// 4. 결제 금액 및 상태 검증
			if (!storedPayment.getAmount().equals(portonePaymentData.getAmount())) {
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

			// 5. 모든 검증 성공 시 DB 업데이트
			storedPayment.setImpUid(impUid);
			storedPayment.setPaymentStatus("PAID");
			storedPayment.setPaidAt(LocalDateTime.now());
			paymentRepository.save(storedPayment);

			responseDto.setSuccess(true);
			responseDto.setMessage("결제가 성공적으로 완료되었습니다.");
			responseDto.setAmount(storedPayment.getAmount());
			responseDto.setPaymentStatus(storedPayment.getPaymentStatus());

			return responseDto;

		} catch (HttpClientErrorException e) {
			log.error("PortOne 결제 정보 조회 HTTP 에러: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
			responseDto.setSuccess(false);
			responseDto.setMessage("결제 검증 중 오류가 발생했습니다. (API 통신 에러)");
			storedPayment.setPaymentStatus("FAILED");
			paymentRepository.save(storedPayment);
			return responseDto;
		} catch (Exception e) {
			log.error("결제 검증 중 예외 발생", e);
			responseDto.setSuccess(false);
			responseDto.setMessage("결제 검증 중 알 수 없는 오류가 발생했습니다.");
			storedPayment.setPaymentStatus("FAILED");
			paymentRepository.save(storedPayment);
			return responseDto;
		}
	}

}
