package com.fullstack.service;


import com.fullstack.model.CarOwnerDashboardDTO.DashboardSummaryDTO;
import com.fullstack.model.CarOwnerDashboardDTO.DeliveryItemDTO;
import com.fullstack.model.CarOwnerDashboardDTO.SalesChartDTO;
import com.fullstack.model.CarOwnerDashboardDTO.WarmthDTO;

import java.util.List;

public interface CarOwnerDashboardService {
    DashboardSummaryDTO getSummary(String ownerId);
    List<DeliveryItemDTO> getDeliveries(String ownerId);
    List<SalesChartDTO> getSalesChart(String ownerId);
    WarmthDTO getWarmth(String ownerId);
    
}

