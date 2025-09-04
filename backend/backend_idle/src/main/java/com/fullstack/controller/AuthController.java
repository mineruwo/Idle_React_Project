package com.fullstack.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.fullstack.entity.CustomerEntity;
import com.fullstack.model.LoginRequestDTO;
import com.fullstack.model.LoginResponseDTO;
import com.fullstack.model.ResetPasswordDTO;
import com.fullstack.model.SnsLinkExistingRequestDTO;
import com.fullstack.model.SnsSignupDTO;
import com.fullstack.model.SnsSignupRequestDTO;
import com.fullstack.model.TokenDTO;
import com.fullstack.repository.CustomerRepository;
import com.fullstack.security.util.TokenCookieUtils;
import com.fullstack.service.AuthService;
import com.fullstack.service.ResetPasswordService;
import com.fullstack.service.SnsOnboardingService;
import com.fullstack.service.SnsTokenService;
import com.fullstack.service.TokenService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Log4j2
public class AuthController {
	
	private static final String OAUTH_SIGNUP_TOKEN = "oauth_signup_token";

	private final AuthService authService;
	private final TokenService tokenService;
	private final CustomerRepository customerRepository;
	private final ResetPasswordService resetPasswordService;
	private final SnsTokenService snsSignupService;
    private final SnsOnboardingService snsOnboardingService;
	
	@PostMapping("/login")
	public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO loginRequestDTO,
			HttpServletResponse response) {
		LoginResponseDTO loginResponseDTO = authService.authenticate(loginRequestDTO);

		TokenDTO tokenDTO = tokenService.issue(loginResponseDTO.getId(), loginResponseDTO.getRole());

		TokenCookieUtils.setAccessTokenCookie(response, tokenDTO.getAccessToken(), tokenDTO.getAtExpiresIn());
		TokenCookieUtils.setRefreshTokenCookie(response, tokenDTO.getRefreshToken(), tokenDTO.getRtExpiresIn());
		TokenCookieUtils.setAuthHintCookie(response, true, tokenDTO.getRtExpiresIn());

		return ResponseEntity.ok(loginResponseDTO);
	}

	@PostMapping("/refresh")
	public ResponseEntity<Void> refresh(HttpServletRequest request, HttpServletResponse response) {
		String refreshToken = TokenCookieUtils.getRefreshTokenFromCookie(request);

		if (refreshToken == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		TokenDTO tokenDTO = tokenService.refresh(refreshToken);
		if (tokenDTO == null || tokenDTO.getAccessToken() == null) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
	    }

		TokenCookieUtils.setAccessTokenCookie(response, tokenDTO.getAccessToken(), tokenDTO.getAtExpiresIn());
		if (tokenDTO.getRefreshToken() != null) {
			TokenCookieUtils.setRefreshTokenCookie(response, tokenDTO.getRefreshToken(), tokenDTO.getRtExpiresIn());
		}
		TokenCookieUtils.setAuthHintCookie(response, true, tokenDTO.getRtExpiresIn());
		
		 return ResponseEntity.ok().build();
	}

	@PostMapping("/logout")
	public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
		
		TokenCookieUtils.clearAccessTokenCookie(response);
		TokenCookieUtils.clearRefreshTokenCookie(response);
		TokenCookieUtils.clearAuthHintCookie(response);

		return ResponseEntity.noContent().build();
	}

	@GetMapping("/me")
	public ResponseEntity<LoginResponseDTO> getCurrentUser(Authentication authentication) {
		
		if (authentication == null || !authentication.isAuthenticated()
				|| authentication instanceof AnonymousAuthenticationToken) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		String id = authentication.getName();

		CustomerEntity customer = customerRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

		LoginResponseDTO loginResponseDTO = new LoginResponseDTO(customer.getId(), customer.getNickname(),
				customer.getRole(), customer.getIdNum());

		return ResponseEntity.ok(loginResponseDTO);
	}
	
	@PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@RequestBody ResetPasswordDTO resetPasswordDTO) {
        resetPasswordService.resetPassword(resetPasswordDTO);
        return ResponseEntity.noContent().build();
    }
	
	
	// sns
	@PostMapping("/oauth/complete-signup")
    public ResponseEntity<Map<String, Object>> completeSnsSignup(
            @CookieValue(name = OAUTH_SIGNUP_TOKEN, required = false) String ticket,
            @Validated @RequestBody SnsSignupRequestDTO body,
            HttpServletResponse response) {
		  
        var opt = snsSignupService.consume(ticket);
        if (opt.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        var t = opt.get();

        // 티켓 → 서비스 입력 DTO로 변환 (이메일 점유 X, 힌트로만 사용)
        SnsSignupDTO sns = SnsSignupDTO.builder()
                .mode("signup")
                .provider(t.getProvider())
                .providerId(t.getProviderId())
                .build();

        try {
            CustomerEntity user = snsOnboardingService.completeSignup(sns, body);

            TokenDTO tokens = tokenService.issue(user.getId(), user.getRole());
            TokenCookieUtils.setAccessTokenCookie(response, tokens.getAccessToken(), tokens.getAtExpiresIn());
            TokenCookieUtils.setRefreshTokenCookie(response, tokens.getRefreshToken(), tokens.getRtExpiresIn());
            TokenCookieUtils.setAuthHintCookie(response, true, tokens.getRtExpiresIn());

            // 티켓 쿠키 제거
            ResponseCookie del = ResponseCookie.from(OAUTH_SIGNUP_TOKEN, "")
                    .httpOnly(true)
                    .secure(false)    // prod HTTPS면 true
                    .sameSite("Lax")
                    .path("/")
                    .maxAge(0)
                    .build();
            response.addHeader("Set-Cookie", del.toString());
            
            return ResponseEntity.ok(Map.of(
                    "id", user.getId(),
                    "role", user.getRole(),
                    "atExpiresIn", tokens.getAtExpiresIn(),
                    "rtExpiresIn", tokens.getRtExpiresIn()
            ));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    /** 기존 로컬 계정과 SNS 연결 (로그인ID/비번 재인증) */
    @PostMapping("/oauth/link-existing")
    public ResponseEntity<Map<String, Object>> linkExisting(
            @CookieValue(name = OAUTH_SIGNUP_TOKEN, required = false) String ticket,
            @Validated @RequestBody SnsLinkExistingRequestDTO body,
            HttpServletRequest request,
            HttpServletResponse response) {
    	
    	 log.info("🔎 link-existing cookie oauth_signup_token={}", ticket);
    	    log.info("🔎 link-existing Cookie header={}", request.getHeader("Cookie"));
    	    log.info("🔎 link-existing body id={}, (password provided? {})",
    	              body.getId(), body.getPasswordEnc()!=null);

        var opt = snsSignupService.consume(ticket);
        if (opt.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        var t = opt.get();

        SnsSignupDTO sns = SnsSignupDTO.builder()
                .mode("link")
                .provider(t.getProvider())
                .providerId(t.getProviderId())
                .build();

        try {
            CustomerEntity user = snsOnboardingService.linkExisting(sns, body);

            TokenDTO tokens = tokenService.issue(user.getId(), user.getRole());
            TokenCookieUtils.setAccessTokenCookie(response, tokens.getAccessToken(), tokens.getAtExpiresIn());
            TokenCookieUtils.setRefreshTokenCookie(response, tokens.getRefreshToken(), tokens.getRtExpiresIn());
            TokenCookieUtils.setAuthHintCookie(response, true, tokens.getRtExpiresIn());

            ResponseCookie del = ResponseCookie.from(OAUTH_SIGNUP_TOKEN, "")
                    .httpOnly(true)
                    .secure(false)    // prod HTTPS면 true
                    .sameSite("Lax")
                    .path("/")
                    .maxAge(0)
                    .build();
            response.addHeader("Set-Cookie", del.toString());

            return ResponseEntity.ok(Map.of(
                    "id", user.getId(),
                    "role", user.getRole(),
                    "atExpiresIn", tokens.getAtExpiresIn(),
                    "rtExpiresIn", tokens.getRtExpiresIn()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        }
    }

	
}
