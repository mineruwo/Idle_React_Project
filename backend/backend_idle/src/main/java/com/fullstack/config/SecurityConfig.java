package com.fullstack.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable()) // CSRF 보호 비활성화 (API 서버의 경우)
            .httpBasic(httpBasic -> httpBasic.disable()) // HTTP Basic 인증 비활성화
            .formLogin(formLogin -> formLogin.disable()) // 폼 로그인 비활성화
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)); // 세션 사용 안함

        http
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/api/**").permitAll() // /api/** 경로는 인증 없이 허용
                .anyRequest().authenticated() // 나머지 요청은 인증 필요
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;

        @Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
        
	}

    	// 인증 제외 경로 허용
//    @Bean
//    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//        http
//            .csrf().disable()
//            .authorizeHttpRequests()
//                .requestMatchers("/api/auth/signup").permitAll()
//                .anyRequest().authenticated();
//        return http.build();
//    }
    }
}