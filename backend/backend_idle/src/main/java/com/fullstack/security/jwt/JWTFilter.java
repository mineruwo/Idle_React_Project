package com.fullstack.security.jwt;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.log4j.Log4j2;

@Log4j2
@Component
public class JWTFilter extends OncePerRequestFilter {

	private final JWTUtil jwtUtil;
	
	public JWTFilter(JWTUtil jwtUtil) {
		this.jwtUtil = jwtUtil;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request,
			HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		
		String token = null;
		// HttpOnly 쿠키에서 토큰 추출
	
		if (request.getCookies() != null) {
			Optional<Cookie> accessTokenCookie = Arrays.stream(request.getCookies())
					.filter(cookie -> "accessToken".equals(cookie.getName()))
					.findFirst();
			if (accessTokenCookie.isPresent()) {
				token = accessTokenCookie.get().getValue();
			}
		}
		
		// Authorization 헤더에서도 토큰을 확인 (혹시 모를 경우 대비)
		if (token == null) {
			String authHeader = request.getHeader("Authorization");
			System.out.println("토큰 "+ null);
			if (authHeader != null && authHeader.startsWith("Bearer ")) {
				token = authHeader.substring(7);
			}
		}

		if (token != null) { // 토큰이 존재하면 유효성 검사
			System.out.println("토큰 유효성 검사 " + token);
			if (jwtUtil.validateToken(token)) {
				String id = jwtUtil.getId(token);
				
				String role = jwtUtil.getRole(token);
				System.out.println("로그인 아이디"+ id +role);
				
				UsernamePasswordAuthenticationToken authToken =
						new UsernamePasswordAuthenticationToken(id, null,
								List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase())));
				
				SecurityContextHolder.getContext().setAuthentication(authToken);
			}
		}
		
		filterChain.doFilter(request, response);
	}
}