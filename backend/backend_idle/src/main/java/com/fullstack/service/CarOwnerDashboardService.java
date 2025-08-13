package com.fullstack.service;


import com.fullstack.model.CarOwnerDashboardDTO;


public interface CarOwnerDashboardService {
    CarOwnerDashboardDTO getDashboard(String ownerId);
}

