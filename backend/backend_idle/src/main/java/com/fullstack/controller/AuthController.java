package com.fullstack.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
import com.fullstack.model.TokenDTO;
import com.fullstack.repository.CustomerRepository;
import com.fullstack.security.jwt.JWTUtil;
import com.fullstack.security.util.TokenCookieUtils;
import com.fullstack.service.CustomerService;
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
	private final JWTUtil jwtUtil;
	private final CustomerRepository customerRepository;
	
	@PostMapping("/login")
	public ResponseEntity<Map<String, Object>> login(@RequestBody CustomerDTO customerDTO, HttpServletResponse response) {
		LoginResponseDTO responseDTO = customerService.login(customerDTO);

		TokenDTO tokenDTO = tokenService.issue(responseDTO.getId(), responseDTO.getRole());

		TokenCookieUtils.setRefreshTokenCookie(response, tokenDTO.getRefreshToken(), tokenDTO.getRtExpiresIn());

		return ResponseEntity.ok(
				Map.of("accessToken", tokenDTO.getAccessToken(),
						"atExpiresIn", tokenDTO.getAtExpiresIn(),
						"id", responseDTO.getId(),
						"role", responseDTO.getRole()));
	}

	@PostMapping("/refresh")
	public ResponseEntity<Map<String, Object>> refresh(HttpServletRequest request, HttpServletResponse response) {
		String refreshToken = TokenCookieUtils.getRefreshTokenFromCookie(request);
		
		if (refreshToken == null)
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

		TokenDTO tokenDTO = tokenService.refresh(refreshToken); 

		TokenCookieUtils.setRefreshTokenCookie(response, tokenDTO.getRefreshToken(), tokenDTO.getRtExpiresIn());

		return ResponseEntity
				.ok(Map.of("accessToken", tokenDTO.getAccessToken(),
							"expiresIn", tokenDTO.getAtExpiresIn()));
	}

	@PostMapping("/logout")
	public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
		String refreshToken = TokenCookieUtils.getRefreshTokenFromCookie(request);
		
		TokenCookieUtils.clearRefreshTokenCookie(response);
		
		return ResponseEntity.noContent().build();
	}
	
	@GetMapping("/auto")
    public ResponseEntity<LoginResponseDTO> getCurrentUser(Authentication authentication) {
	    String id = authentication.getName();
		
		CustomerEntity customerEntity = customerRepository.findById(id)
	            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
		
        LoginResponseDTO loginResponseDTO = new LoginResponseDTO(
        	customerEntity.getId(),
        	customerEntity.getNickname(),
        	customerEntity.getRole()
        );

        return ResponseEntity.ok(loginResponseDTO);
    }
}
