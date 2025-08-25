package com.fullstack.controller;

import com.fullstack.model.CarOwnerOrderListDTO;
import com.fullstack.model.CarOwnerOrderListDTO.OrderCreateRequest;
import com.fullstack.model.CarOwnerOrderListDTO.OrderUpdateRequest;
import com.fullstack.service.CarOwnerOrderListService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/car-owner/orders")
@RequiredArgsConstructor
public class CarOwnerOrderController {

    private final CarOwnerOrderListService orderService;

    // 목록 (상태/기간/검색/페이징)
    @GetMapping
    public Page<CarOwnerOrderListDTO.OrderSummaryResponse> list(
            @AuthenticationPrincipal String ownerId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size,
            @RequestParam(name = "status", required = false) String status, // CREATED/ONGOING/COMPLETED/CANCELED
            @RequestParam(name = "from", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from, // yyyy-MM-dd
            @RequestParam(name = "to", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,   // yyyy-MM-dd
            @RequestParam(name = "q", required = false) String q           // 검색어(출발/도착/화물)
    ) {
        return orderService.list(ownerId, page, size, status, from, to, q);
    }

    // 단건 조회
    @GetMapping("/{orderId}")
    public CarOwnerOrderListDTO.OrderDetailResponse detail(
            @AuthenticationPrincipal String ownerId,
            @PathVariable("orderId") Long orderId
    ) {
        return orderService.detail(ownerId, orderId);
    }

    // 생성
    @PostMapping
    public CarOwnerOrderListDTO.OrderDetailResponse create(
            @AuthenticationPrincipal String ownerId,
            @Valid @RequestBody OrderCreateRequest req
    ) {
        return orderService.create(ownerId, req);
    }

    // 수정
    @PutMapping("/{orderId}")
    public CarOwnerOrderListDTO.OrderDetailResponse update(
            @AuthenticationPrincipal String ownerId,
            @PathVariable("orderId") Long orderId,
            @Valid @RequestBody OrderUpdateRequest req
    ) {
        return orderService.update(ownerId, orderId, req);
    }

    // 상태 변경 (CREATED→ONGOING, ONGOING→COMPLETED, 또는 CANCELED)
    @PatchMapping("/{orderId}/status")
    public CarOwnerOrderListDTO.OrderDetailResponse changeStatus(
            @AuthenticationPrincipal String ownerId,
            @PathVariable("orderId") Long orderId,
            @RequestParam(name = "status") String status
    ) {
        return orderService.changeStatus(ownerId, orderId, status);
    }

    // 차량 배정/변경
    @PatchMapping("/{orderId}/assign-vehicle")
    public CarOwnerOrderListDTO.OrderDetailResponse assignVehicle(
            @AuthenticationPrincipal String ownerId,
            @PathVariable("orderId") Long orderId,
            @RequestParam(name = "vehicleId") Long vehicleId
    ) {
        return orderService.assignVehicle(ownerId, orderId, vehicleId);
    }

    // 삭제
    @DeleteMapping("/{orderId}")
    public void delete(
            @AuthenticationPrincipal String ownerId,
            @PathVariable("orderId") Long orderId
    ) {
        orderService.delete(ownerId, orderId);
    }
}