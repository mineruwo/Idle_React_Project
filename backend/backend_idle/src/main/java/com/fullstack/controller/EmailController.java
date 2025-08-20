package com.fullstack.controller;

import java.time.Instant;
import java.util.Collections;
import java.util.Enumeration;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fullstack.repository.CustomerRepository;
import com.fullstack.security.util.HashUtils;
import com.fullstack.service.EmailService;
import com.fullstack.service.ResetTokenService;
import com.fullstack.service.ResetTokenServiceImpl.Token;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/email")
public class EmailController {

	private final EmailService emailService;
	private final ResetTokenService resetTokenService;
	private final CustomerRepository customerRepository;
	
	public enum Purpose { SIGNUP_VERIFY_EMAIL, RESET_PASSWORD }
	
	// 세션에 넣어둘 이메일 인증 상태 묶음
	// 만료 + 1회성
	public record CodeEntry(String codeHash, long expiresEpoch) implements java.io.Serializable {}
	
	private static String key(String email, Purpose p) {
        return "emailCode:" + p.name() + ":" + email.toLowerCase();
    }
	
	@PostMapping("/send-code")
	public ResponseEntity<Map<String, Object>> sendCode(
			@RequestParam("email") String email,
			@RequestParam(value = "purpose", defaultValue = "SIGNUP_VERIFY_EMAIL") Purpose purpose,
			HttpSession session) {
		
		String normalizedEmail = email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
		
		long ttlSeconds = 600; 
        long exp = Instant.now().getEpochSecond() + ttlSeconds;

        
        if (purpose == Purpose.RESET_PASSWORD) {
            boolean exists = customerRepository.existsById(normalizedEmail);

            if (!exists) {
                return ResponseEntity.accepted().body(Map.of(
                        "message", "인증 코드 발송 완료",
                        "ttlSeconds", ttlSeconds
                ));
            }
        }
        
        String code = emailService.sendVerificationEmail(normalizedEmail);
        
        String hash = HashUtils.sha256(code);
        session.setAttribute(key(normalizedEmail, purpose), new CodeEntry(hash, exp));

        return ResponseEntity.accepted().body(Map.of(
                "message", "인증 코드 발송 완료",
                "ttlSeconds", ttlSeconds
        ));
	}

	@PostMapping("/verify-code")
	public ResponseEntity<Map<String, Object>> verifyCode(
			@RequestParam("email") String email,
			@RequestParam("code") String code,
			@RequestParam(value = "purpose", defaultValue = "SIGNUP_VERIFY_EMAIL") Purpose purpose,
			HttpSession session) {
		
		String k = key(email, purpose);
        CodeEntry entry = (CodeEntry) session.getAttribute(k);
        
        if (entry == null || entry.expiresEpoch < Instant.now().getEpochSecond()) {
            session.removeAttribute(k);
            return ResponseEntity.ok(Map.of("ok", false, "reason", "expired_or_missing"));
        }
        if (!HashUtils.sha256(code).equals(entry.codeHash)) {
            return ResponseEntity.ok(Map.of("ok", false, "reason", "mismatch"));
        }

        // 일회성 소비
        session.removeAttribute(k);

        if (purpose == Purpose.RESET_PASSWORD) {
            Token token = resetTokenService.issueResetToken(email);
            return ResponseEntity.ok(Map.of(
                    "ok", true,
                    "token", token.token(),
                    "expiresAt", token.expiresAt().toString()
            ));
        } else {
            return ResponseEntity.ok(Map.of("ok", true, "verified", true));
        }
	}
}
