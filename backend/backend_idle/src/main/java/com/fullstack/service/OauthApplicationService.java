package com.fullstack.service;

import java.util.Map;

import com.fullstack.model.OauthLinkExistingDTO;
import com.fullstack.model.OauthSignupRequestDTO;

import jakarta.servlet.http.HttpServletResponse;

public interface OauthApplicationService {

	public Map<String, Object> completeSignup(String ticket, OauthSignupRequestDTO dto, HttpServletResponse res);
    public Map<String, Object> linkExisting(String ticket, OauthLinkExistingDTO dto, HttpServletResponse res);
}
