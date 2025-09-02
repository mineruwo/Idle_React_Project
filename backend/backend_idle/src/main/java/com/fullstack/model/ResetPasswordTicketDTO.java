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
public class ResetPasswordTicketDTO {

	private String id;
	private LocalDateTime issuedAt;
	private LocalDateTime expiresAt;
}
