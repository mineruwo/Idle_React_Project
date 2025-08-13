package com.fullstack.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.fullstack.security.jwt.JWTFilter;


import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JWTFilter jwtFilter;

    SecurityConfig(JWTFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable()) // CSRF 보호 비활성화 (API 서버)
            .httpBasic(httpBasic -> httpBasic.disable()) // HTTP Basic 인증 비활성화
            .formLogin(formLogin -> formLogin.disable()) // 폼 로그인 비활성화
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // 세션 사용 안함
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/orders/**",   // 🚚 오더 등록/조회/삭제 전부 허용
                    "/api/auth/**",     // (선택) 로그인/회원가입 API도 허용
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
                    "/api/email/**"
                ).permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

           

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000", // 로컬 프론트 주소
            "https://idle-react-project-front.onrender.com" // 배포된 프론트 주소
        ));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setAllowCredentials(true); // 쿠키 전달 허용 (withCredentials: true 필요할 경우)

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
