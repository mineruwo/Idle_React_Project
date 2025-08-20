package com.fullstack.security.util;

import java.security.SecureRandom;
import java.util.Base64;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class ResetTokenUtils {
	
	private static final SecureRandom RNG = new SecureRandom();
	
	public static String generateToken() {
        byte[] b = new byte[32];
        RNG.nextBytes(b);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(b);
    }
	
}
