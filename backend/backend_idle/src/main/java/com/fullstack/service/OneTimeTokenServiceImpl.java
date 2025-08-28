package com.fullstack.service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

@Service
public class OneTimeTokenServiceImpl implements OneTimeTokenService {

	private static final SecureRandom RNG = new SecureRandom();

	private record Entry(String purpose, Object payload, LocalDateTime expiresAt) {
	}

	private final ConcurrentMap<String, Entry> store = new ConcurrentHashMap<>();

	private final ScheduledExecutorService janitor = Executors.newSingleThreadScheduledExecutor(r -> {
		Thread t = new Thread(r, "one-time-token-janitor");
		t.setDaemon(true);
		return t;
	});

	@PostConstruct
	void init() {
		// 만료 청소
		janitor.scheduleAtFixedRate(this::purge, 1, 60, TimeUnit.SECONDS);
	}

	@Override
	public String issue(String purpose, Duration ttl, Object payload) {
		String token = randomUrlToken();
		LocalDateTime exp = LocalDateTime.now().plus(ttl);
		store.put(token, new Entry(purpose, payload, exp));
		return token;
	}

	@SuppressWarnings("unchecked")
	@Override
	public <T> Optional<T> consume(String token, String expectedPurpose, Class<T> type) {
		if (token == null || token.isBlank())
			return Optional.empty();

		// 1회용: remove 후 검증
		Entry e = store.remove(token);
		if (e == null)
			return Optional.empty();
		if (!expectedPurpose.equals(e.purpose))
			return Optional.empty();
		if (e.expiresAt.isBefore(LocalDateTime.now()))
			return Optional.empty();

		Object payload = e.payload;
		if (payload == null || !type.isInstance(payload))
			return Optional.empty();

		return Optional.of((T) payload);
	}

	private void purge() {
		LocalDateTime now = LocalDateTime.now();
		store.entrySet().removeIf(en -> en.getValue().expiresAt.isBefore(now));
	}

	private static String randomUrlToken() {
		byte[] buf = new byte[32];
		RNG.nextBytes(buf);
		return Base64.getUrlEncoder().withoutPadding().encodeToString(buf);
	}

	@PreDestroy
	public void shutdown() {
		janitor.shutdownNow();
	}

}
