package com.fullstack.service;

import com.fullstack.entity.CustomerEntity;
import com.fullstack.model.SnsLinkExistingRequestDTO;
import com.fullstack.model.SnsSignupDTO;
import com.fullstack.model.SnsSignupRequestDTO;

public interface SnsOnboardingService {

	CustomerEntity completeSignup(SnsSignupDTO snsSignupDTO, SnsSignupRequestDTO req);
    CustomerEntity linkExisting(SnsSignupDTO snsSignupDTO, SnsLinkExistingRequestDTO req);
}
