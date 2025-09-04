package com.fullstack.service;

import com.fullstack.entity.CustomerEntity;
import com.fullstack.model.OauthLinkExistingDTO;
import com.fullstack.model.OauthSignupDTO;
import com.fullstack.model.OauthSignupRequestDTO;

public interface SnsOnboardingService {

	public CustomerEntity completeSignup(OauthSignupDTO oauthSignupDTO, OauthSignupRequestDTO oauthSignupRequestDTO);
	public CustomerEntity linkExisting(OauthSignupDTO oauthSignupDTO, OauthLinkExistingDTO oauthLinkExistingDTO);
}
