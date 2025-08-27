package com.fullstack.service;

import java.time.Duration;
import java.util.Optional;

import com.fullstack.model.SnsSignupDTO;

public interface SnsSignupService {
	
	String issue(String provider, String providerId, String mode, Duration ttl);
    Optional<SnsSignupDTO> consume(String token);   

}
