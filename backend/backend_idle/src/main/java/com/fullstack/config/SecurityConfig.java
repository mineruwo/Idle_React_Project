package com.fullstack.config;

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

import com.fullstack.security.jwt.JWTFilter;
import com.fullstack.security.oauth.OAuth2SuccessHandler;
import com.fullstack.service.CustomOAuth2UserService;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

	private final JWTFilter jwtFilter;
	private final CustomOAuth2UserService customOAuth2UserService;
	private final OAuth2SuccessHandler oAuth2SuccessHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
     
    	http
            // CORS & CSRF
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable()) // CSRF 보호 비활성화 (API 서버)
            .httpBasic(httpBasic -> httpBasic.disable()) // HTTP Basic 인증 비활성화
            .formLogin(formLogin -> formLogin.disable()) // 폼 로그인 비활성화
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // 세션 사용 안함
            //.anonymous(anonymous -> anonymous.disable()) // 익명 비활성화
            .authorizeHttpRequests(auth -> auth
                // 프리플라이트
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // 주문 생성은 SHIPPER 만 가능
                .requestMatchers(HttpMethod.POST, "/api/orders").hasRole("SHIPPER")

                .requestMatchers(HttpMethod.PUT, "/api/orders/**").hasRole("SHIPPER")

                // 내 주문 목록은 인증된 사용자만
                .requestMatchers(HttpMethod.GET, "/api/orders/my").authenticated()

                // 나머지 주문 관련 GET 요청은 공개
                .requestMatchers(HttpMethod.GET, "/api/orders/**").permitAll()

                // 입찰 API (현재 전부 공개, 운영 시 필요에 따라 롤 제한)
                .requestMatchers(HttpMethod.POST, "/api/offers/{offerId}/accept").hasRole("SHIPPER")
                // 나머지 입찰 API는 공개 (필요에 따라 롤 제한)
                .requestMatchers("/api/offers/**").permitAll()

                // 인증/토큰 관련
                .requestMatchers("/api/auth/**").permitAll()

                // 관리자(요구 반영: 공개, 운영 전환 시 제한 권장)
                                .requestMatchers(
                    "/api/public/**", // Public API for notices
                    "/api/orders/**",   // 🚚 오더 등록/조회/삭제 전부 허용
                    "/auth/**",   
                    "/api/auth/login",
                    "/api/auth/refresh",
                    "/api/auth/logout",
                    "/api/auth/reset-password",
                    "/api/auth/email/**",  
                    "/api/auth/complete-signup",
                    "/api/auth/link-existing",
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
                .requestMatchers("/api/car-owner/**").hasRole("CARRIER") // 🚚 차주 관련 API는 CARRIER 롤 필요
                .requestMatchers(HttpMethod.POST, "/api/auth/reset-password").permitAll()
                .requestMatchers(
                        "/api/auth/me",
                        "/api/reviews"     // 리뷰 작성 및 삭제는 인증된 사용자만 가능
                ).authenticated()
                
                .anyRequest().authenticated()
            )
            // sns 로그인 페이지 연결
            .oauth2Login(o -> o
                    .authorizationEndpoint(a -> a.baseUri("/oauth2/authorization"))
                    .redirectionEndpoint(r -> r.baseUri("/login/oauth2/code/*"))
                    .userInfoEndpoint(u -> u.userService(customOAuth2UserService))
                    .successHandler(oAuth2SuccessHandler)
                    .failureHandler((req, res, ex) -> {  // 오류 내용을 확인하려면 임시로 추가
                        ex.printStackTrace();
                        res.sendError(HttpServletResponse.SC_UNAUTHORIZED, ex.getMessage());
                    })
                )
            
            
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);


        return http.build();
    }

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration config = new CorsConfiguration();
		config.setAllowedOrigins(Arrays.asList("http://localhost:3000", // 로컬 프론트 주소
				"https://idle-react-project-front.onrender.com" // 배포된 프론트 주소
		));
		config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
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
