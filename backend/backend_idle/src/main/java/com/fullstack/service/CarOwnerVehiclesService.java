package com.fullstack.service;


import org.springframework.data.domain.Page;
import com.fullstack.model.CarOwnerVehiclesDTO.VehicleSummaryResponse;
import com.fullstack.model.CarOwnerVehiclesDTO.VehicleDetailResponse;
import com.fullstack.model.CarOwnerVehiclesDTO.VehicleCreateRequest;
import com.fullstack.model.CarOwnerVehiclesDTO.VehicleUpdateRequest;

public interface CarOwnerVehiclesService {
    Page<VehicleSummaryResponse> list(String ownerId, int page, int size);
    VehicleDetailResponse get(String ownerId, Long vehicleId);
    VehicleDetailResponse create(String ownerId, VehicleCreateRequest req);
    VehicleDetailResponse update(String ownerId, Long vehicleId, VehicleUpdateRequest req);
    VehicleDetailResponse setPrimary(String ownerId, Long vehicleId, boolean primary);
    void delete(String ownerId, Long vehicleId);
}