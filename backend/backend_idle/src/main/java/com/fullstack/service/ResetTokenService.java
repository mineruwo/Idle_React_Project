package com.fullstack.service;

import com.fullstack.service.ResetTokenServiceImpl.Token;

public interface ResetTokenService {

	public Token issueResetToken(String email);
}
