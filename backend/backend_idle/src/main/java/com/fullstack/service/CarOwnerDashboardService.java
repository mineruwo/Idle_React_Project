package com.fullstack.service;


import com.fullstack.model.CarOwnerDashboardDTO.DashboardSummaryDTO;
import com.fullstack.model.CarOwnerDashboardDTO.DeliveryItemDTO;
import com.fullstack.model.CarOwnerDashboardDTO.SalesChartDTO;
import com.fullstack.model.CarOwnerDashboardDTO.WarmthDTO;

import java.util.List;

public interface CarOwnerDashboardService {
    DashboardSummaryDTO getSummary(String ownerId, String period);
    List<DeliveryItemDTO> getDeliveries(String ownerId);
    List<SalesChartDTO> getSalesChart(String ownerId);
    WarmthDTO getWarmth(String ownerId);
    
    void markDeparted(String ownerId, Long orderId);
    void markCompleted(String ownerId, Long orderId);
    
}

