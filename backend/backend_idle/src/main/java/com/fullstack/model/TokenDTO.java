package com.fullstack.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TokenDTO {
	
	private String accessToken;
	private String refreshToken;
	private long atExpiresIn;
	private long rtExpiresIn;
}
