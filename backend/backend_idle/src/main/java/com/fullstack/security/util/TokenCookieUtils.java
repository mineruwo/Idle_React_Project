package com.fullstack.security.util;

import org.springframework.http.ResponseCookie;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class TokenCookieUtils {
	
	private static final String REFRESH_TOKEN_NAME = "refreshToken";
	
	public static void setRefreshTokenCookie(HttpServletResponse response, String token, long expire) {
		ResponseCookie cookie = ResponseCookie.from(REFRESH_TOKEN_NAME, token)
				.httpOnly(true)
				.secure(false) // 수정
				.path("/")
				.maxAge(expire)
				.sameSite("Lax") //
				.build();
		
		response.addHeader("Set-Cookie", cookie.toString());
				
	}
	
	public static String getRefreshTokenFromCookie(HttpServletRequest request) {
		if (request.getCookies() != null) {
			for (Cookie cookie : request.getCookies()) {
				if (REFRESH_TOKEN_NAME.equals(cookie.getName())) {
					return cookie.getValue();
				}
			}
		}
		return null;
	}
	
	public static void clearRefreshTokenCookie(HttpServletResponse response) {
		ResponseCookie cookie = ResponseCookie.from(REFRESH_TOKEN_NAME, "")
				.httpOnly(true)
				.secure(false)
				.path("/")
				.maxAge(0)
				.sameSite("Lax") // 위와 동일
				.build();
		
		response.addHeader("Set-Cookie", cookie.toString());
	}
}
