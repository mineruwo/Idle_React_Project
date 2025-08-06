package com.fullstack.controller;

import com.fullstack.model.TransportSummaryDTO;
import com.fullstack.service.TransportDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/car-owner/dashboard")
@RequiredArgsConstructor
public class TransportDashboardController {

	private final TransportDashboardService dashboardService;

	@GetMapping("/dashboard/summary")
	public ResponseEntity<TransportSummaryDTO> getTransportSummary(@RequestParam String nickname) {
		System.out.println("📌 요청 들어옴 nickname: " + nickname); // 찍히는지 확인
		TransportSummaryDTO summary = dashboardService.getTransportSummary(nickname);
		return ResponseEntity.ok(summary);
	}
}