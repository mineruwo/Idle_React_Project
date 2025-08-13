package com.fullstack.controller;

import com.fullstack.model.CarOwnerDashboardDTO;
import com.fullstack.model.TransportSummaryDTO;
import com.fullstack.service.CarOwnerDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/car-owner/dashboard")
@RequiredArgsConstructor
public class CarOwnerDashboardController {

	private final CarOwnerDashboardService dashboardService;
	
	
	  @GetMapping
	  public CarOwnerDashboardDTO get(@AuthenticationPrincipal String ownerId) {
	    return dashboardService.getDashboard(ownerId); // 내부에서 여러 서비스 합성
	  }
}
