package com.fullstack.service;

import java.util.Map;

import com.fullstack.model.enums.EmailPurpose;

import jakarta.servlet.http.HttpSession;

public interface EmailService {
	
	public String sendVerificationEmail(String toEmail);
	
	Map<String, Object> sendCode(String email, EmailPurpose purpose, HttpSession session);
	
    Map<String, Object> verifyCode(String email, String code, EmailPurpose purpose, HttpSession session);
}
