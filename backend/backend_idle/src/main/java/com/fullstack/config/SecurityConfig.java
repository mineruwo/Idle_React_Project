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
import org.springframework.http.HttpStatus;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
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
            .exceptionHandling(exceptionHandling -> exceptionHandling
                .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)) // For API calls
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()	// 프리플라이트
                .requestMatchers("/actuator/**").permitAll()	// 헬스 체크 엔드포인트
                .requestMatchers(
                		"/api/auth/**",	// 로그인, 토큰 갱신, 비번 초기화 등
                		"/api/customer/**", // 회원가입
                		"/auth/**",	// SNS 로그인 redirect
                		"/api/public/**", // Public API for notices
                		//"/api/orders/**",  // 🚚 오더 등록/조회/삭제 전부 허용 (필요하면 주석 제거)
                		//"/api/offers/**",  // 입찰 API (필요하면 주석 제거)
                        //"/api/payment/**", // (필요하면 주석 제거)
                		"/api/reviews/target/**", // 특정 대상의 리뷰 목록 조회는 누구나 가능
                		//"/api/inquiries/**", // 일반 문의 관련 API 허용 (InquiryController)
                		"/api/admin/**", // admin
                        "/api/email/**", // email
                		"/ws/**", "/ws-chat/**" // 웹소켓 경로
                ).permitAll()
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
