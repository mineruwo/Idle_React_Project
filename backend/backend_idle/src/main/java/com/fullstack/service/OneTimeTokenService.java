package com.fullstack.service;

import java.time.Duration;
import java.util.Optional;

public interface OneTimeTokenService {
	
	String issue(String purpose, Duration ttl, Object payload);
	
	public <T> Optional<T> peek(String token, String expectedPurpose, Class<T> type);
	
	public void invalidate(String token);
}
