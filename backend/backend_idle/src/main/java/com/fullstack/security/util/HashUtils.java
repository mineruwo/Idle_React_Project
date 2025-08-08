package com.fullstack.security.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

public class HashUtils {
	 public static String sha256(String input) {
	        try {
	            MessageDigest md = MessageDigest.getInstance("SHA-256");
	            byte[] bytes = md.digest(input.getBytes(StandardCharsets.UTF_8));
	            StringBuilder sb = new StringBuilder(bytes.length * 2);
	            for (byte b : bytes) {
	                String hex = Integer.toHexString(0xff & b);
	                if (hex.length() == 1) sb.append('0');
	                sb.append(hex);
	            }
	            return sb.toString();
	        } catch (Exception e) {
	            throw new IllegalStateException("SHA-256 hashing failed", e);
	        }
	    }
}
