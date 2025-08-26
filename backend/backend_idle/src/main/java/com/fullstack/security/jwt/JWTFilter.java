package com.fullstack.security.jwt;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

 @Component @Log4j2 @RequiredArgsConstructor
public class JWTFilter extends OncePerRequestFilter {

    private final JWTUtil jwtUtil;

	private static final AntPathMatcher MATCHER = new AntPathMatcher();
    // 공개 경로 목록 정의
    private static final List<String> PUBLIC_PATTERNS = Arrays.asList(
    	// OAuth
    	"/oauth2/**", "/login/oauth2/**", "/oauth2/authorization/**",
    	// 인증
    	"/api/auth/login",
    	"/api/auth/refresh",
    	"/api/auth/logout",
        "/api/admin/login",
        "/api/admin/signup",
        "/api/auth/reset-password",
        // websocket
        "/ws/**"
    );
    
    /** 퍼블릭 GET(읽기 전용) 허용 경로 */
    private static boolean isPublicGetPath(String uri) {
        if (uri == null) return false;
        if (uri.equals("/api/orders")) return true;                         // 목록/검색
        if (uri.matches("^/api/orders/\\d+$")) return true;                 // 단건
        if (uri.matches("^/api/orders/\\d+/assignment$")) return true;      // 배정 조회
        if (uri.matches("^/api/orders/\\d+/offers/summary$")) return true;  // 입찰 요약
        return false;
    }
    
    /** 여기서 '스킵할지'를 한 번에 결정 */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String uri = request.getRequestURI();
        String method = request.getMethod();

        boolean publicPath = PUBLIC_PATTERNS.stream().anyMatch(p -> MATCHER.match(p, uri));
        boolean publicGet  = "GET".equalsIgnoreCase(method) && isPublicGetPath(uri);

        boolean skip = publicPath || publicGet;
        log.info("JWTFilter skip? method={}, uri={}, result={}", method, uri, skip);
        return skip;
    }
    
    /** 스킵이 아닌 요청만 토큰 검증 → SecurityContext 세팅 */
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {


        log.info("JWTFilter: Request received for URI: {} and Method: {}", request.getRequestURI(), request.getMethod()); // ADD THIS LINE

        final String method = request.getMethod();
        final String uri    = request.getRequestURI();

        // 1) 쿠키 → 2) Authorization 헤더(Bearer) 순으로 추출
        String token = extractTokenFromCookies(request);
        if (token == null) token = extractTokenFromAuthHeader(request);

        if (token != null) {
            try {
                if (jwtUtil.validateToken(token)) {
                    String id   = Optional.ofNullable(jwtUtil.getId(token)).orElse(null);
                    String role = Optional.ofNullable(jwtUtil.getRole(token)).orElse("user");

                    if (id != null) {
                        var auth = new UsernamePasswordAuthenticationToken(
                            id,
                            null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                        );


                    log.info("JWTFilter: Setting Authentication. User: {}, Role: {}, Authorities: {}", id, role, auth.getAuthorities());

                    log.info("JWTFilter: Attempting to set Authentication. User: {}, Role: {}, Authorities: {}", id, role, auth.getAuthorities()); // ADD THIS LINE

                    SecurityContextHolder.getContext().setAuthentication(auth);
                    log.debug("JWT 인증 세팅 완료: id={}, role={}", id, role);
                }
            } else {
                log.debug("JWT 검증 실패(만료/서명오류 등) → 비인증으로 진행");
            }
        } catch (Exception e) {
                log.debug("JWT 파싱 예외 → 비인증으로 진행. msg={}", e.getMessage());
            }
        } else {
            log.debug("JWT 토큰 없음 → 비인증으로 진행");
        }

        // 반드시 한 번만 체인 진행
        filterChain.doFilter(request, response);
    }
    
    /** 쿠키에서 accessToken 추출 */
    private String extractTokenFromCookies(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return null;
        for (Cookie c : cookies) {
            if ("accessToken".equals(c.getName())) {
                return c.getValue();
            }
        }
        return null;
    }
    
    /** Authorization: Bearer ... 헤더에서 토큰 추출 */
    private String extractTokenFromAuthHeader(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null) return null;
        String prefix = "Bearer ";
        return authHeader.startsWith(prefix) ? authHeader.substring(prefix.length()) : null;
    }

}
