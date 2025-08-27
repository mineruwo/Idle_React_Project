package com.fullstack.service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Service;

import com.fullstack.model.SnsSignupDTO;

import jakarta.annotation.PreDestroy;

@Service
public class SnsSignupServiceImpl implements SnsSignupService {

	private static final SecureRandom RNG = new SecureRandom();
	private final ConcurrentMap<String, Entry> store = new ConcurrentHashMap<>();
	
	private final ScheduledExecutorService janitor =
	        Executors.newSingleThreadScheduledExecutor(r -> {
	            Thread t = new Thread(r, "sns-signup-janitor");
	            t.setDaemon(true);
	            return t;
	        });

	public SnsSignupServiceImpl() {
		// 만료
		janitor.scheduleAtFixedRate(this::purge, 1, 60, TimeUnit.SECONDS);
	}

	@Override
	public String issue(String provider, String providerId, String mode, Duration ttl) {
		String token = randomUrlToken();
		LocalDateTime now = LocalDateTime.now();
		SnsSignupDTO ticket = new SnsSignupDTO(UUID.randomUUID().toString(), provider, providerId, mode, now,
				now.plus(ttl));
		store.put(token, new Entry(ticket, ticket.getExpiresAt()));
		return token;
	}

	@Override
	public Optional<SnsSignupDTO> consume(String token) {
		if (token == null || token.isBlank()) {
            return Optional.empty();
        }

        Entry e = store.remove(token); // 1회용
        if (e == null) {
            return Optional.empty();
        }
        if (e.expiresAt.isBefore(LocalDateTime.now())) {
            return Optional.empty();
        }
        return Optional.of(e.ticket);
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

	private record Entry(SnsSignupDTO ticket, LocalDateTime expiresAt) {
	}
	
	@PreDestroy
    public void shutdown() {
        janitor.shutdownNow();
    }

}
