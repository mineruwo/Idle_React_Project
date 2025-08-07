package com.fullstack.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fullstack.model.CarOwnerProfileDTO;
import com.fullstack.model.CarOwnerProfileModifyDTO;
import com.fullstack.service.CarOwnerService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/car-owner/profile")
@RequiredArgsConstructor
public class CarOwnerProfileController {
	
	private final CarOwnerService carOwnerService;
	
	@GetMapping("/{customName}")
	public ResponseEntity<CarOwnerProfileDTO> getProfile(@PathVariable String customName){
		return ResponseEntity.ok(carOwnerService.getProfile(customName));
	}
	
	@PutMapping("/{customName}")
	public ResponseEntity<Void> updateProfile(
			@PathVariable String customName,
			@RequestBody CarOwnerProfileModifyDTO dto){
		carOwnerService.updateProfile(customName, dto);
		return ResponseEntity.ok().build();
	}
			

}
