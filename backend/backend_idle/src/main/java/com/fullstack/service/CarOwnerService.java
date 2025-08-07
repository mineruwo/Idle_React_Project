package com.fullstack.service;

import com.fullstack.model.CarOwnerProfileModifyDTO;
import com.fullstack.model.CarOwnerProfileDTO;

public interface CarOwnerService {
	CarOwnerProfileDTO getProfile(String customName);
	void updateProfile(String customName, CarOwnerProfileModifyDTO dto);
}
