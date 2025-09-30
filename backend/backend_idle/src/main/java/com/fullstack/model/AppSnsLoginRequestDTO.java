package com.fullstack.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppSnsLoginRequestDTO {

	private String provider; // google, kakao, naver
	private String accessToken; // kakao/naver 용
	private String idToken; // google 용
}
