package com.fullstack.controller;

import com.fullstack.model.CarOwnerDashboardDTO.DashboardSummaryDTO;
import com.fullstack.model.CarOwnerDashboardDTO.DeliveryItemDTO;
import com.fullstack.model.CarOwnerDashboardDTO.SalesChartDTO;
import com.fullstack.model.CarOwnerDashboardDTO.WarmthDTO;

import com.fullstack.service.CarOwnerDashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import java.util.List;
import java.util.Map;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/car-owner/dashboard")
@RequiredArgsConstructor
@Log4j2
public class CarOwnerDashboardController {

    private final CarOwnerDashboardService dashboardService;

    @GetMapping("/summary")
    public DashboardSummaryDTO getSummary(
            @AuthenticationPrincipal String ownerId,
            @RequestParam(name = "period", defaultValue = "month") String period  // ✅ name 지정
    ) {
        return dashboardService.getSummary(ownerId, period);
    }

    @GetMapping("/deliveries")
    public List<DeliveryItemDTO> getDeliveries(@AuthenticationPrincipal String ownerId) {
        log.info("[GET] /deliveries ownerId={}", ownerId);
        return dashboardService.getDeliveries(ownerId);
    }

    @GetMapping("/sales-chart")
    public List<SalesChartDTO> getSalesChart(
            @AuthenticationPrincipal String ownerId,
            @RequestParam(name = "period", defaultValue = "month") String period  // ✅ name 지정
    ) {
        // period를 쓰실 계획이면 서비스 시그니처도 period 받도록 바꾸세요.
        return dashboardService.getSalesChart(ownerId);
    }

    @GetMapping("/warmth")
    public WarmthDTO getWarmth(@AuthenticationPrincipal String ownerId) {
        return dashboardService.getWarmth(ownerId);
    }
}