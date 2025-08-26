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
public class OauthInfoDTO {
	
	private String provider; // google | kakao | naver
	private String providerId; // sub | id | response.id
	private String email; 
	private boolean emailVerified;
	private String flow; 
	private long exp;
}
