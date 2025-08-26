package com.fullstack.service;


import com.fullstack.model.CarOwnerOrderListDTO;
import com.fullstack.model.enums.OrderStatus;

import org.springframework.data.domain.Page;

import java.time.LocalDate;
public interface CarOwnerOrderListService {
    Page<CarOwnerOrderListDTO.OrderSummaryResponse> list(String loginId, int page, int size,
                                             String status, LocalDate from, LocalDate to, String q);

    CarOwnerOrderListDTO.OrderDetailResponse detail(String loginId, Long orderId);

    CarOwnerOrderListDTO.OrderDetailResponse create(String loginId, CarOwnerOrderListDTO.OrderCreateRequest req);

    CarOwnerOrderListDTO.OrderDetailResponse update(String loginId, Long orderId, CarOwnerOrderListDTO.OrderUpdateRequest req);

    CarOwnerOrderListDTO.OrderDetailResponse changeStatus(String loginId, Long orderId, OrderStatus status);

    void delete(String loginId, Long orderId);
}