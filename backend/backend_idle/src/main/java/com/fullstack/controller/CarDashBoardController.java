package com.fullstack.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fullstack.model.DashboardDTO;
import com.fullstack.repository.CarDashboardRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("api/dashboard")
@RequiredArgsConstructor
public class CarDashBoardController {
	
	private final CarDashboardRepository carDashBoardRepository;
	
	@GetMapping
	public ResponseEntity<DashboardDTO> getDashboardData(){
		DashboardDTO dto = carDashBoardRepository.getDashboardData();
		
		return ResponseEntity.ok(dto);
	}
}
 