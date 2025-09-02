package com.fullstack.service;

import java.time.Duration;
import java.util.Optional;

public interface OneTimeTokenService {
	
	String issue(String purpose, Duration ttl, Object payload);
	
	<T> Optional<T> consume(String token, String expectedPurpose, Class<T> type);
	<T> Optional<T> peek(String token, String expectedPurpose, Class<T> type); // ✅ 추가
}
