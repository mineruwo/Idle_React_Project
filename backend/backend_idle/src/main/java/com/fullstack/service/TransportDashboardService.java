package com.fullstack.service;

import com.fullstack.model.TransportSummaryDTO;

public interface TransportDashboardService {
	TransportSummaryDTO getTransportSummary(String username);
}
