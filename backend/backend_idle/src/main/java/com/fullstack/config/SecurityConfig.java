package com.fullstack.config;

import com.fullstack.security.jwt.JWTFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JWTFilter jwtFilter;

    public SecurityConfig(JWTFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // CORS & CSRF
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable()) // CSRF 보호 비활성화 (API 서버)
            .httpBasic(httpBasic -> httpBasic.disable()) // HTTP Basic 인증 비활성화
            .formLogin(formLogin -> formLogin.disable()) // 폼 로그인 비활성화
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // 세션 사용 안함
            .anonymous(anonymous -> anonymous.disable()) // 익명 비활성화
            .authorizeHttpRequests(auth -> auth
                // 프리플라이트
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // 공개 API (읽기/검색/배정 등)
                .requestMatchers("/api/orders/**").permitAll()

                // 입찰 API (현재 전부 공개, 운영 시 필요에 따라 롤 제한)
                .requestMatchers("/api/offers/**").permitAll()

                // 인증/토큰 관련
                .requestMatchers("/api/auth/**").permitAll()

                // 관리자(요구 반영: 공개, 운영 전환 시 제한 권장)
                .requestMatchers(
                    "/api/orders/**",   // 🚚 오더 등록/조회/삭제 전부 허용
                    "/api/auth/login",
                    "/api/auth/refresh",
                    "/api/auth/logout",
                    "/api/auth/reset-password",
                    "/api/auth/email/**",      
                    "/api/admin/login", // 경로 변경
                    "/api/admin/check-auth", // 추가: 인증 상태 확인 엔드포인트 허용
                    "/api/admin/logout", // 추가: 로그아웃 엔드포인트 허용
                    "/api/admin/accounts", // 경로 변경
                    "/api/admin/customers", // 고객 목록 조회 허용
                    "/api/admin/customers/**", // 고객 생성/수정/삭제 허용 (POST, PUT, DELETE)
                    "/ws/**", "/ws-chat/**", // 웹소켓 경로
                    "/api/customer/**", // 고객 관련 API
                    "/api/payment/**",
                    "/api/admin/chat-sessions/**", // 채팅 세션 관련 API 허용
                    "/api/email/**",
                    "/api/reviews/target/**" // 특정 대상의 리뷰 목록 조회는 누구나 가능
                ).permitAll()
                .requestMatchers(
                    "/api/auth/me",
                    "/api/reviews"     // 리뷰 작성 및 삭제는 인증된 사용자만 가능
                ).authenticated()
                .anyRequest().authenticated()
            )

            // JWT 필터 장착 (UsernamePasswordAuthenticationFilter 앞)
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // 프론트 도메인
        config.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",
            "https://idle-react-project-front.onrender.com"
        ));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(Arrays.asList("*"));
        // 크리덴셜(쿠키) 허용
        config.setAllowCredentials(true);
        // (노출 헤더가 필요하면 추가)
        // config.setExposedHeaders(Arrays.asList("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
