package com.fullstack.security.util;

import org.springframework.http.ResponseCookie;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class TokenCookieUtils {

	public static void setAccessTokenCookie(HttpServletResponse response, String token, long maxAgeSeconds) {
		ResponseCookie cookie = ResponseCookie.from("accessToken", token).httpOnly(true).secure(true).sameSite("None")
				.path("/").maxAge(maxAgeSeconds).build();
		response.addHeader("Set-Cookie", cookie.toString());
	}

	public static void clearAccessTokenCookie(HttpServletResponse response) {
		ResponseCookie cookie = ResponseCookie.from("accessToken", "").httpOnly(true).secure(true).sameSite("None")
				.path("/").maxAge(0).build();
		response.addHeader("Set-Cookie", cookie.toString());
	}

	public static void setRefreshTokenCookie(HttpServletResponse response, String token, long maxAgeSeconds) {
		ResponseCookie cookie = ResponseCookie.from("refreshToken", token).httpOnly(true).secure(true).sameSite("None")
				.path("/").maxAge(maxAgeSeconds).build();
		response.addHeader("Set-Cookie", cookie.toString());
	}

	public static void clearRefreshTokenCookie(HttpServletResponse response) {
		ResponseCookie cookie = ResponseCookie.from("refreshToken", "").httpOnly(true).secure(true).sameSite("None")
				.path("/").maxAge(0).build();
		response.addHeader("Set-Cookie", cookie.toString());
	}

	public static String getAccessTokenFromCookie(HttpServletRequest request) {
		return getCookieValue(request, "accessToken");
	}

	public static String getRefreshTokenFromCookie(HttpServletRequest request) {
		return getCookieValue(request, "refreshToken");
	}

	public static String getCookieValue(HttpServletRequest request, String name) {
		if (request.getCookies() == null)
			return null;
		for (Cookie c : request.getCookies()) {
			if (name.equals(c.getName())) {
				return c.getValue();
			}
		}
		return null;
	}
}
