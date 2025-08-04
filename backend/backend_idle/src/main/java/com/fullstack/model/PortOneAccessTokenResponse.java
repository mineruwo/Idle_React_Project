package com.fullstack.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PortOneAccessTokenResponse {

	private int code;
    private String message;
    private PortOneAccessTokenResponseData response;

    @Getter
    @Setter
    public static class PortOneAccessTokenResponseData {
        private String access_token;
        private Long now;
        private Long expired_at;
    }
	
}
