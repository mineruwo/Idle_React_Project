package com.fullstack.controller;

import com.fullstack.model.CarOwnerOrderListDTO;
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

    private final CarOwnerOrderListService carOwnerOrderListService;

    @GetMapping
    public Page<CarOwnerOrderListDTO.OrderSummaryResponse> list(
            @AuthenticationPrincipal String loginId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "from", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(name = "to", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(name = "q", required = false) String q
    ) {
        return carOwnerOrderListService.list(loginId, page, size, status, from, to, q);
    }

    @GetMapping("/{orderId}")
    public CarOwnerOrderListDTO.OrderDetailResponse detail(
            @AuthenticationPrincipal String loginId,
            @PathVariable("orderId") Long orderId
    ) {
        return carOwnerOrderListService.detail(loginId, orderId);
    }
    @PostMapping
    public CarOwnerOrderListDTO.OrderDetailResponse create(
            @AuthenticationPrincipal String loginId,
            @Valid @RequestBody CarOwnerOrderListDTO.OrderCreateRequest req
    ) {
        return carOwnerOrderListService.create(loginId, req);
    }

    @PutMapping("/{orderId}")
    public CarOwnerOrderListDTO.OrderDetailResponse update(
            @AuthenticationPrincipal String loginId,
            @PathVariable("orderId") Long orderId,
            @Valid @RequestBody CarOwnerOrderListDTO.OrderUpdateRequest req
    ) {
        return carOwnerOrderListService.update(loginId, orderId, req);
    }

    @PatchMapping("/{orderId}/status")
    public CarOwnerOrderListDTO.OrderDetailResponse changeStatus(
            @AuthenticationPrincipal String loginId,
            @PathVariable("orderId") Long orderId,
            @RequestParam(name = "status") String status
    ) {
        return carOwnerOrderListService.changeStatus(loginId, orderId, status);
    }

    @DeleteMapping("/{orderId}")
    public void delete(
            @AuthenticationPrincipal String loginId,
            @PathVariable("orderId") Long orderId
    ) {
        carOwnerOrderListService.delete(loginId, orderId);
    }
}