package com.fullstack.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

	private final JavaMailSender mailSender;
	
	public String sendVerificationEmail(String toEmail) {
        String code = String.valueOf((int) (Math.random() * 900000) + 100000); // 6자리 코드
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("회원가입 이메일 인증 코드");
        message.setText("인증 코드: " + code);
        mailSender.send(message);

        return code; 
    }
}
