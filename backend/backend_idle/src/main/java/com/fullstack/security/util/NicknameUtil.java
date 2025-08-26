package com.fullstack.security.util;

import java.security.SecureRandom;
import java.util.UUID;
import java.util.function.Predicate;

public final class NicknameUtil {

    private static final SecureRandom RNG = new SecureRandom();

    private NicknameUtil() {}

    public static String pickAvailable(String preferredBase,
                                       String provider,
                                       Predicate<String> isTaken) {
        String base = (preferredBase == null || preferredBase.isBlank())
                ? "user_" + (provider == null ? "sns" : provider)
                : preferredBase.trim();

        // 원본 시도
        String cand = base;
        if (!isTaken.test(cand)) return cand;

        // 짧은 접미사 재시도 (최대 10회)
        for (int i = 0; i < 10; i++) {
            cand = base + "_" + randBase36(8);        // 8자리 base36
            if (!isTaken.test(cand)) return cand;
        }

        // 더 강한 접미사로 재시도 (최대 10회)
        for (int i = 0; i < 10; i++) {
            cand = base + "_" + uuidHex(12);          // 12 hex(48비트)
            if (!isTaken.test(cand)) return cand;
        }

        // 시시간 섞기
        return base + "_" + uuidHex(8) + "_" + System.currentTimeMillis();
    }

    private static String randBase36(int len) {
        StringBuilder sb = new StringBuilder(len);
        for (int i = 0; i < len; i++) {
            int n = RNG.nextInt(36); // 0..35
            sb.append(Character.forDigit(n, 36)); // 0-9a-z
        }
        return sb.toString();
    }

    private static String uuidHex(int hexLen) {
        String hex = UUID.randomUUID().toString().replace("-", "");
        return hexLen >= hex.length() ? hex : hex.substring(0, hexLen);
    }
}