package com.fullstack.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OauthSignupRequestDTO {

	private String customName;
	private String nickname;
	private String role;
	
	// 앱에서만 필요한 필드
    private String provider;
    private String providerId;
}
