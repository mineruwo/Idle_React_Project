package com.fullstack.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fullstack.service.EmailService;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/email")
public class EmailController {

	private final EmailService emailService;

	@PostMapping("/send-code")
	public ResponseEntity<String> sendCode(@RequestParam("email") String email, HttpSession session) {
		String code = emailService.sendVerificationEmail(email);

		session.setAttribute("emailCode:" + email, code);

		return ResponseEntity.ok("인증 코드 발송 완료");
	}

	@PostMapping("/verify-code")
	public ResponseEntity<Boolean> verifyCode(@RequestParam("email") String email, @RequestParam("code") String code, HttpSession session) {
		String savedCode = (String) session.getAttribute("emailCode:" + email);
		if (savedCode != null && savedCode.equals(code)) {
			return ResponseEntity.ok(true);
		}
		return ResponseEntity.ok(false);
	}
}
