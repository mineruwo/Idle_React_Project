package com.fullstack.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.fullstack.entity.CustomerEntity;
import com.fullstack.model.CustomerDTO;
import com.fullstack.model.LoginResponseDTO;
import com.fullstack.model.ResetPasswordDTO;
import com.fullstack.model.TokenDTO;
import com.fullstack.repository.CustomerRepository;
import com.fullstack.security.jwt.JWTUtil;
import com.fullstack.security.util.TokenCookieUtils;
import com.fullstack.service.CustomerService;
import com.fullstack.service.ResetPasswordService;
import com.fullstack.service.TokenService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

	private final CustomerService customerService;
	private final TokenService tokenService;
	private final CustomerRepository customerRepository;
	private final ResetPasswordService resetPasswordService;

	@PostMapping("/login")
	public ResponseEntity<Map<String, Object>> login(@RequestBody CustomerDTO customerDTO,
			HttpServletResponse response) {
		LoginResponseDTO responseDTO = customerService.login(customerDTO);

		TokenDTO tokenDTO = tokenService.issue(responseDTO.getId(), responseDTO.getRole());

		TokenCookieUtils.setAccessTokenCookie(response, tokenDTO.getAccessToken(), tokenDTO.getAtExpiresIn());
		TokenCookieUtils.setRefreshTokenCookie(response, tokenDTO.getRefreshToken(), tokenDTO.getRtExpiresIn());
		TokenCookieUtils.setAuthHintCookie(response, true, tokenDTO.getRtExpiresIn());

		return ResponseEntity.ok(Map.of("id", responseDTO.getId(), "role", responseDTO.getRole(), "atExpiresIn",
				tokenDTO.getAtExpiresIn(), "rtExpiresIn", tokenDTO.getRtExpiresIn()));
	}

	@PostMapping("/refresh")
	public ResponseEntity<Map<String, Object>> refresh(HttpServletRequest request, HttpServletResponse response) {
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
		
		return ResponseEntity
				.ok(Map.of("atExpiresIn", tokenDTO.getAtExpiresIn(), "rtRotated", tokenDTO.getRefreshToken() != null));
	}

	@PostMapping("/logout")
	public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
		String refreshToken = TokenCookieUtils.getRefreshTokenFromCookie(request);

		TokenCookieUtils.clearAccessTokenCookie(response);
		TokenCookieUtils.clearRefreshTokenCookie(response);
		TokenCookieUtils.clearAuthHintCookie(response);

		return ResponseEntity.noContent().build();
	}

	@GetMapping("/auto")
	public ResponseEntity<LoginResponseDTO> getCurrentUser(Authentication authentication) {
		
		if (authentication == null || !authentication.isAuthenticated()
				|| authentication instanceof AnonymousAuthenticationToken) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		String id = authentication.getName();

		CustomerEntity customerEntity = customerRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

		LoginResponseDTO loginResponseDTO = new LoginResponseDTO(customerEntity.getId(), customerEntity.getNickname(),
				customerEntity.getRole(), customerEntity.getIdNum());

		return ResponseEntity.ok(loginResponseDTO);
	}
	
	@PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordDTO resetPasswordDTO) {
        resetPasswordService.resetPassword(resetPasswordDTO);
        return ResponseEntity.ok().build();
    }
	
	
}
