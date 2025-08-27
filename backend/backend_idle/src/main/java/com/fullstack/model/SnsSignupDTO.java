package com.fullstack.model;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SnsSignupDTO {

	private String jti;
	private String provider;
	private String providerId;
	private String mode;
	private LocalDateTime issuedAt;
	private LocalDateTime expiresAt;
}
