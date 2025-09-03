package com.fullstack.service;

import java.io.Serializable;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.fullstack.model.enums.EmailPurpose;
import com.fullstack.repository.CustomerRepository;
import com.fullstack.security.util.HashUtils;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

	private final JavaMailSender mailSender;
	private final CustomerRepository customerRepository;
	private final ResetTokenService resetTokenService;
	
	@Value("${email.code.ttl-seconds:600}")
    private long ttlSeconds;
	
	private static final class CodeEntry implements Serializable {
        private static final long serialVersionUID = 1L;

        private final String codeHash;
        private final long expiresEpoch;

        CodeEntry(String codeHash, long expiresEpoch) {
            this.codeHash = codeHash;
            this.expiresEpoch = expiresEpoch;
        }

        String codeHash() {
            return codeHash;
        }

        long expiresEpoch() {
            return expiresEpoch;
        }
    }
	
	private static String normalize(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private static String key(String email, EmailPurpose p) {
        return "emailCode:" + p.name() + ":" + email.toLowerCase(Locale.ROOT);
    }
	
	public String sendVerificationEmail(String toEmail) {
        String code = String.valueOf((int) (Math.random() * 900000) + 100000); // 6자리 코드
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("이메일 인증 코드");
        message.setText("인증 코드: " + code);
        mailSender.send(message);

        return code; 
    }
	
	@Override
    public Map<String, Object> sendCode(String email, EmailPurpose purpose, HttpSession session) {
        final String normalizedEmail = normalize(email);
        final long exp = Instant.now().getEpochSecond() + ttlSeconds;

        // 비밀번호 찾기 (DB 에 존재하지 않는 ID 처리)
        if (purpose == EmailPurpose.RESET_PASSWORD) {
            boolean exists = customerRepository.existsById(normalizedEmail);
            if (!exists) {
                return Map.of("message", "인증 코드 발송 완료", "ttlSeconds", ttlSeconds);
            }
        }

        String code = sendVerificationEmail(normalizedEmail);
        String hash = HashUtils.sha256(code);
        session.setAttribute(key(normalizedEmail, purpose), new CodeEntry(hash, exp));

        return Map.of("message", "인증 코드 발송 완료", "ttlSeconds", ttlSeconds);
    }

    @Override
    public Map<String, Object> verifyCode(String email, String code, EmailPurpose purpose, HttpSession session) {
        final String normalizedEmail = normalize(email);
        final String k = key(normalizedEmail, purpose);
        CodeEntry entry = (CodeEntry) session.getAttribute(k);

        long now = Instant.now().getEpochSecond();
        if (entry == null || entry.expiresEpoch() < now) {
            session.removeAttribute(k); 
            return Map.of("ok", false, "reason", "expired_or_missing");
        }
        if (!HashUtils.sha256(code).equals(entry.codeHash())) {
            return Map.of("ok", false, "reason", "mismatch");
        }

        session.removeAttribute(k);

        // 비밀번호 찾기 -> 임시 토큰 발급
        if (purpose == EmailPurpose.RESET_PASSWORD) {
        	Duration ttl = Duration.ofMinutes(15);
        	String token = resetTokenService.issue(normalizedEmail, ttl);
            return Map.of(
                    "ok", true,
                    "token", token,
                    "expiresAt", java.time.LocalDateTime.now().plus(ttl).toString()
            );
        } else {
            return Map.of("ok", true, "verified", true);
        }
    }
}
