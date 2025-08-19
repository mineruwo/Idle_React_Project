package com.fullstack.security.jwt;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
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

    // 공개 경로 목록 정의
    private static final List<String> PUBLIC_PATHS = Arrays.asList(
        "/api/customer/login",
        "/api/customer/signup",
        "/api/customer/check-id",
        "/api/customer/check-nickname",
        "/api/admin/login",
        "/api/admin/signup",
        "/ws/"
    );

	public JWTFilter(JWTUtil jwtUtil) {
		this.jwtUtil = jwtUtil;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {

        String path = request.getRequestURI();

        // 요청 경로가 공개 경로인지 확인
        boolean isPublicPath = PUBLIC_PATHS.stream().anyMatch(publicPath -> 
            path.startsWith("/ws/") ? path.startsWith(publicPath) : path.equals(publicPath)
        );

        if (isPublicPath) {
            filterChain.doFilter(request, response); // 공개 경로는 JWT 검증을 건너뜁니다.
            return;
        }

		try {
			String token = resolveFromCookie(request);

			// 2) Authorization 헤더(Bearer) 보조
			if (token == null) {
				String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
				if (authHeader != null && authHeader.startsWith("Bearer ")) {
					token = authHeader.substring(7);
				}
			}

			if (token != null
                    && SecurityContextHolder.getContext().getAuthentication() == null
                    && jwtUtil.validateToken(token)) {

                String id   = jwtUtil.getId(token);
                String role = jwtUtil.getRole(token); 

                List<GrantedAuthority> authorities = Collections.emptyList();
                
                if (role != null && !role.isBlank()) {
                    String springRole = role.startsWith("ROLE_") ? role : "ROLE_" + role.toUpperCase();
                    authorities = List.of(new SimpleGrantedAuthority(springRole));
                }

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(id, null, authorities);
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContext ctx = SecurityContextHolder.createEmptyContext();
                ctx.setAuthentication(auth);
                SecurityContextHolder.setContext(ctx);
            }
        } catch (Exception e) {
            SecurityContextHolder.clearContext();
        }
		filterChain.doFilter(request, response);
	}

	private String resolveFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return null;
        for (Cookie c : cookies) {
            if ("accessToken".equals(c.getName())) return c.getValue();
        }
        return null;
    }
}