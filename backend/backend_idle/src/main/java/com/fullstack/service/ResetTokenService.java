package com.fullstack.service;

import java.time.Duration;
import java.util.Optional;

import com.fullstack.model.ResetPasswordTicketDTO;

public interface ResetTokenService {

	public String issue(String id, Duration TTL);
    Optional<ResetPasswordTicketDTO> consume(String token);
}
