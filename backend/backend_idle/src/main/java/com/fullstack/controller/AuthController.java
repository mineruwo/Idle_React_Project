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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.fullstack.entity.CustomerEntity;
import com.fullstack.model.LoginRequestDTO;
import com.fullstack.model.LoginResponseDTO;
import com.fullstack.model.OauthLinkExistingDTO;
import com.fullstack.model.OauthSignupRequestDTO;
import com.fullstack.model.ResetPasswordDTO;
import com.fullstack.model.TokenDTO;
import com.fullstack.repository.CustomerRepository;
import com.fullstack.security.util.TokenCookieUtils;
import com.fullstack.service.AuthService;
import com.fullstack.service.OauthApplicationService;
import com.fullstack.service.ResetPasswordService;
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
	

	private final AuthService authService;
	private final TokenService tokenService;
	private final CustomerRepository customerRepository;
	private final ResetPasswordService resetPasswordService;
	private final OauthApplicationService oauthApplicationService;
	
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
	
	
	@PostMapping("/complete-signup")
    public ResponseEntity<Map<String, Object>> completeSignup(
            @RequestParam("token") String token,
            @Validated @RequestBody OauthSignupRequestDTO dto,
            HttpServletResponse response) {

        return ResponseEntity.ok(oauthApplicationService.completeSignup(token, dto, response));
    }

    @PostMapping("/link-existing")
    public ResponseEntity<Map<String, Object>> linkExisting(
            @RequestParam("token") String token,
            @Validated @RequestBody OauthLinkExistingDTO dto,
            HttpServletResponse response) {

        return ResponseEntity.ok(oauthApplicationService.linkExisting(token, dto, response));
    }

	
}
