package com.fullstack.controller;


import com.fullstack.service.CarOwnerVehiclesService;
import com.fullstack.model.CarOwnerVehiclesDTO.VehicleSummaryResponse;
import com.fullstack.model.CarOwnerVehiclesDTO.VehicleUpdateRequest;
import com.fullstack.model.CarOwnerVehiclesDTO.VehicleDetailResponse;
import com.fullstack.model.CarOwnerVehiclesDTO.VehicleCreateRequest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/car-owner/vehicles")
@RequiredArgsConstructor
public class CarOwnerVehiclesController {

    private final CarOwnerVehiclesService vehicleService;

    @GetMapping
    public Page<VehicleSummaryResponse> list(
            // JWT에서 username이 loginId/ownerId 라면:
            @AuthenticationPrincipal String ownerId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        return vehicleService.list(ownerId, page, size);
    }

    @GetMapping("/{vehicleId}")
    public VehicleDetailResponse get(
            @AuthenticationPrincipal String ownerId,
            @PathVariable(name = "vehicleId") Long vehicleId) {
        return vehicleService.get(ownerId, vehicleId);
    }

    @PostMapping
    public VehicleDetailResponse create(
            @AuthenticationPrincipal String ownerId,
            @Valid @RequestBody VehicleCreateRequest req) {
        return vehicleService.create(ownerId, req);
    }

    @PutMapping("/{vehicleId}")
    public VehicleDetailResponse update(
            @AuthenticationPrincipal String ownerId,
            @PathVariable(name = "vehicleId") Long vehicleId,
            @Valid @RequestBody VehicleUpdateRequest req) {
        return vehicleService.update(ownerId, vehicleId, req);
    }

    @PatchMapping("/{vehicleId}/primary")
    public VehicleDetailResponse setPrimary(
            @AuthenticationPrincipal String ownerId,
            @PathVariable(name = "vehicleId") Long vehicleId,
            @RequestParam(name = "primary", defaultValue = "true") boolean primary) {
        return vehicleService.setPrimary(ownerId, vehicleId, primary);
    }

    @DeleteMapping("/{vehicleId}")
    public void delete(
            @AuthenticationPrincipal String ownerId,
            @PathVariable(name = "vehicleId") Long vehicleId) {
        vehicleService.delete(ownerId, vehicleId);
    }
}