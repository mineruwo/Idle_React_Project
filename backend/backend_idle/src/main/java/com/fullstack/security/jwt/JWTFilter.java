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
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Component
@Log4j2
@RequiredArgsConstructor
public class JWTFilter extends OncePerRequestFilter {

    private final JWTUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        log.info("JWTFilter: Request URI={}, Method={}", request.getRequestURI(), request.getMethod());

        // 1) 쿠키 → 2) Authorization 헤더 순서로 토큰 추출
        String token = extractTokenFromCookies(request);
        if (token == null) token = extractTokenFromAuthHeader(request);

        if (token != null) {
            try {
                if (jwtUtil.validateToken(token)) {
                    String id   = jwtUtil.getId(token);
                    String role = Optional.ofNullable(jwtUtil.getRole(token)).orElse("user");

                    var auth = new UsernamePasswordAuthenticationToken(
                            id,
                            null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                    );

                    SecurityContextHolder.getContext().setAuthentication(auth);
                    log.debug("JWT 인증 성공: id={}, role={}", id, role);
                } else {
                    log.debug("JWT 검증 실패 (만료/서명 오류 등)");
                }
            } catch (Exception e) {
                log.debug("JWT 파싱 예외 → 비인증으로 진행. msg={}", e.getMessage());
            }
        } else {
            log.debug("JWT 토큰 없음 → 비인증으로 진행");
        }

        filterChain.doFilter(request, response);
    }

    private String extractTokenFromCookies(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        return Arrays.stream(request.getCookies())
                .filter(c -> "accessToken".equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }

    private String extractTokenFromAuthHeader(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        String prefix = "Bearer ";
        return (authHeader != null && authHeader.startsWith(prefix))
                ? authHeader.substring(prefix.length())
                : null;
    }
}
