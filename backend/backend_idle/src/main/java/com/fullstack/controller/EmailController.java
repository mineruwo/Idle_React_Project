package com.fullstack.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fullstack.model.enums.EmailPurpose;
import com.fullstack.repository.CustomerRepository;
import com.fullstack.service.EmailService;
import com.fullstack.service.ResetTokenService;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/email")
public class EmailController {

	private final EmailService emailService;
	
	@PostMapping("/send-code")
    public ResponseEntity<Map<String, Object>> sendCode(
            @RequestParam("email") String email,
            @RequestParam(value = "purpose", defaultValue = "SIGNUP_VERIFY_EMAIL") EmailPurpose purpose,
            HttpSession session) {

        var body = emailService.sendCode(email, purpose, session);
        // 기존과 동일하게 202 Accepted
        return ResponseEntity.accepted().body(body);
    }

    @PostMapping("/verify-code")
    public ResponseEntity<Map<String, Object>> verifyCode(
            @RequestParam("email") String email,
            @RequestParam("code") String code,
            @RequestParam(value = "purpose", defaultValue = "SIGNUP_VERIFY_EMAIL") EmailPurpose purpose,
            HttpSession session) {

        var body = emailService.verifyCode(email, code, purpose, session);
        return ResponseEntity.ok(body);
    }
}
