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

    @GetMapping("/summary")
    public ResponseEntity<TransportSummaryDTO> getTransportSummary(@RequestParam String username) {
        TransportSummaryDTO summary = dashboardService.getTransportSummary(username);
        return ResponseEntity.ok(summary);
    }
}