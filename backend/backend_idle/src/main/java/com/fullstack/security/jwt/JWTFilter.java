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
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {
    	log.info(">>>>>>>>>>>>>> {} {}", request.getMethod(), request.getRequestURI());
        final String method = request.getMethod();
        final String uri    = request.getRequestURI();
        log.info("cookieToken? {}", method != null);
        log.info("headerToken? {}", uri != null);

        // 1) CORS 프리플라이트는 무조건 패스
        if ("OPTIONS".equalsIgnoreCase(method)) {
            filterChain.doFilter(request, response);
            return;
        }

        // 2) 퍼블릭 GET 엔드포인트는 토큰 없어도 패스
        //    (보드 목록/검색/상세/배정/요약 등 읽기 전용)
        if ("GET".equalsIgnoreCase(method) && isPublicGetPath(uri)) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3) 토큰 추출: HttpOnly 쿠키 → Authorization 헤더(Bearer) 순
        String token = extractTokenFromCookies(request);
        if (token == null) {
            token = extractTokenFromAuthHeader(request);
        }

        // 4) 토큰이 있으면 검증 후 SecurityContext 설정 (없으면 그냥 패스)
        if (token != null) {
            try {
                if (jwtUtil.validateToken(token)) {
                	log.info("validateToken = {}", jwtUtil);
                    String id   = jwtUtil.getId(token);
                    String role = jwtUtil.getRole(token);

                    UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                            id,
                            null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                        );

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.debug("JWT 인증 세팅 완료: id={}, role={}", id, role);
                } else {
                    log.debug("JWT 검증 실패(만료/서명오류 등). 요청은 비인증으로 계속 진행합니다. uri={}", uri);
                }
            } catch (Exception e) {
                // 토큰 파싱 중 예외가 나도 요청 자체는 막지 않음(비인증으로 처리)
                log.debug("JWT 파싱 중 예외 발생(비인증으로 통과). uri={}, message={}", uri, e.getMessage());
            }
        } else {
            log.debug("JWT 토큰 없음(비인증으로 통과). uri={}", uri);
        }

        filterChain.doFilter(request, response);
    }

    /** 공개 GET 경로 판별 */
    private boolean isPublicGetPath(String uri) {
        // 필요한 공개 경로를 여기서 관리
        // 예) /api/orders, /api/orders/123, /api/orders/123/assignment, /api/orders/123/offers/summary
        if (uri == null) return false;
        if (uri.equals("/api/orders")) return true;                       // 목록/검색
        if (uri.matches("^/api/orders/\\d+$")) return true;               // 단건 조회
        if (uri.matches("^/api/orders/\\d+/assignment$")) return true;    // 배정 정보 조회
        if (uri.matches("^/api/orders/\\d+/offers/summary$")) return true; // 입찰 요약
        // 그 외 공개 GET이 있으면 여기에 추가
        return false;
    }

    /** 쿠키에서 accessToken 추출 */
    private String extractTokenFromCookies(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return null;
        Optional<Cookie> access = Arrays.stream(cookies)
                .filter(c -> "accessToken".equals(c.getName()))
                .findFirst();
        return access.map(Cookie::getValue).orElse(null);
    }

    /** Authorization: Bearer ... 헤더에서 토큰 추출 */
    private String extractTokenFromAuthHeader(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null) return null;
        String prefix = "Bearer ";
        if (authHeader.startsWith(prefix)) {
            return authHeader.substring(prefix.length());
        }
        return null;
    }
}
