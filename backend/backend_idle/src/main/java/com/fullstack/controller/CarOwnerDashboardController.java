package com.fullstack.controller;


import com.fullstack.model.CarOwnerDashboardDTO.DashboardSummaryDTO;
import com.fullstack.model.CarOwnerDashboardDTO.DeliveryItemDTO;
import com.fullstack.model.CarOwnerDashboardDTO.SalesChartDTO;
import com.fullstack.model.CarOwnerDashboardDTO.WarmthDTO;

import com.fullstack.service.CarOwnerDashboardService;
import lombok.RequiredArgsConstructor;

import java.util.List;


import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/car-owner/dashboard")
@RequiredArgsConstructor
public class CarOwnerDashboardController {

    private final CarOwnerDashboardService dashboardService;

    @GetMapping("/summary")
    public DashboardSummaryDTO getSummary(@AuthenticationPrincipal String ownerId) {
        return dashboardService.getSummary(ownerId);
    }

    @GetMapping("/deliveries")
    public List<DeliveryItemDTO> getDeliveries(@AuthenticationPrincipal String ownerId) {
        return dashboardService.getDeliveries(ownerId);
    }
    @GetMapping("/sales-chart")
   public List<SalesChartDTO> getSalesChart(@AuthenticationPrincipal String ownerId) {
        return dashboardService.getSalesChart(ownerId);
    }

    @GetMapping("/warmth")
    public WarmthDTO getWarmth(@AuthenticationPrincipal String ownerId) {
        return dashboardService.getWarmth(ownerId);
    }
}
