package com.fullstack.controller;

import com.fullstack.model.PaymentRequestDto;
import com.fullstack.model.PaymentResponseDto;
import com.fullstack.model.PaymentVerificationDto;
import com.fullstack.model.PointUsageRequestDto;
import com.fullstack.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@Log4j2
public class PaymentController {

	private final PaymentService paymentService;

	@PostMapping("/prepare")
	public ResponseEntity<PaymentResponseDto> preparePayment(@RequestBody PaymentRequestDto requestDto) {
		log.info("결제 준비 요청 : {}", requestDto);
		try {
			PaymentResponseDto response = paymentService.preparePayment(requestDto);
			if (response.isSuccess()) {
				return ResponseEntity.ok(response);
			} else {
				return ResponseEntity.badRequest().body(response);
			}
		} catch (Exception e) {
			log.error("결제 준비 중 오류 발생", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new PaymentResponseDto(false,
					"결제 준비 중 서버 오류가 발생했습니다.", null, requestDto.getMerchantUid(), null, null, null));
		}

	}

	@PostMapping("/verify")
	public ResponseEntity<PaymentResponseDto> verifyPayment(@RequestBody PaymentVerificationDto verificationDto) {
		log.info("결제 검증 요청: {}", verificationDto);
		try {
			PaymentResponseDto response = paymentService.verifyPayment(verificationDto);
			if (response.isSuccess()) {
				return ResponseEntity.ok(response);
			} else {
				return ResponseEntity.badRequest().body(response);
			}
		} catch (Exception e) {
			log.error("결제 검증 중 오류 발생", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(new PaymentResponseDto(false, "결제 검증 중 서버 오류가 발생했습니다.", null,
							verificationDto.getMerchantUid(), verificationDto.getImpUid(), null, null));
		}
	}

	@PostMapping("/use")
	public ResponseEntity<?> usePoints(@RequestBody PointUsageRequestDto requestDto) {
		log.info("포인트 사용 요청: {}", requestDto);
		try {
			paymentService.usePoints(requestDto);
			return ResponseEntity.ok().body(Map.of("success", true, "message", "포인트가 성공적으로 사용되었습니다."));
		} catch (IllegalArgumentException | IllegalStateException e) {
			log.warn("포인트 사용 실패: {}", e.getMessage());
			return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
		} catch (Exception e) {
			log.error("포인트 사용 중 서버 오류 발생", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("success", false, "message", "서버 오류로 인해 포인트 사용에 실패했습니다."));
		}
	}
	
    @PostMapping("/fail")
    public ResponseEntity<?> failPayment(@RequestBody Map<String, String> requestBody) {
        String merchantUid = requestBody.get("merchantUid");
        log.info("결제 실패 처리 요청: merchantUid={}", merchantUid);
        try {
            paymentService.failPayment(merchantUid);
            return ResponseEntity.ok().body(Map.of("success", true, "message", "결제 실패 상태가 기록되었습니다."));
        } catch (Exception e) {
            log.error("결제 실패 처리 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "결제 실패 처리 중 서버 오류가 발생했습니다."));
        }
    }
}
