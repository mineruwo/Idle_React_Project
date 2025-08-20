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
            .csrf(csrf -> csrf.disable())

            // 세션 미사용
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // 기본 인증 제거
            .httpBasic(b -> b.disable())
            .formLogin(f -> f.disable())

            // 권한 규칙
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
                    "/api/admin/login",
                    "/api/admin/check-auth",
                    "/api/admin/logout",
                    "/api/admin/accounts",
                    "/api/admin/customers",
                    "/api/admin/customers/**",
                    "/api/admin/chat-sessions/**"
                ).permitAll()

                // 기타 공개 엔드포인트
                .requestMatchers("/api/customer/**").permitAll()
                .requestMatchers("/api/payment/**").permitAll()
                .requestMatchers("/api/email/**").permitAll()
                .requestMatchers("/ws/**", "/ws-chat/**").permitAll()

                // 나머지 보호
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
        // 메소드/헤더
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
