package com.fullstack.service;


import com.fullstack.model.CarOwnerOrderListDTO;

import org.springframework.data.domain.Page;

import java.time.LocalDate;

public interface CarOwnerOrderListService {
    Page<CarOwnerOrderListDTO.OrderSummaryResponse> list(String ownerId, int page, int size, String status, LocalDate from, LocalDate to, String q);
    CarOwnerOrderListDTO.OrderDetailResponse detail(String ownerId, Long orderId);
    CarOwnerOrderListDTO.OrderDetailResponse create(String ownerId, CarOwnerOrderListDTO.OrderCreateRequest req);
    CarOwnerOrderListDTO.OrderDetailResponse update(String ownerId, Long orderId, CarOwnerOrderListDTO.OrderUpdateRequest req);
    CarOwnerOrderListDTO.OrderDetailResponse changeStatus(String ownerId, Long orderId, String status);
    CarOwnerOrderListDTO.OrderDetailResponse assignVehicle(String ownerId, Long orderId, Long vehicleId);
    void delete(String ownerId, Long orderId);
}