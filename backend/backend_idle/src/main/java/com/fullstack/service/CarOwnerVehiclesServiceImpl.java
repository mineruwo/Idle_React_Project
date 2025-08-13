package com.fullstack.service;


import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fullstack.entity.CarOwnerVehicles;
import com.fullstack.model.CarOwnerVehiclesDTO.VehicleCreateRequest;
import com.fullstack.model.CarOwnerVehiclesDTO.VehicleDetailResponse;
import com.fullstack.model.CarOwnerVehiclesDTO.VehicleSummaryResponse;
import com.fullstack.model.CarOwnerVehiclesDTO.VehicleUpdateRequest;

import com.fullstack.repository.CarOwnerVehiclesRepository;

import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class CarOwnerVehiclesServiceImpl implements CarOwnerVehiclesService {

    private final CarOwnerVehiclesRepository repo;

    @Transactional(readOnly = true)
    @Override
    public Page<VehicleSummaryResponse> list(String ownerId, int page, int size) {
        Page<CarOwnerVehicles> p = repo.findByOwnerIdOrderByPrimaryDescIdDesc(ownerId, PageRequest.of(page, size));
        return p.map(this::toSummary);
    }

    @Transactional(readOnly = true)
    @Override
    public VehicleDetailResponse get(String ownerId, Long vehicleId) {
        CarOwnerVehicles v = repo.findByIdAndOwnerId(vehicleId, ownerId)
                .orElseThrow(() -> new NoSuchElementException("VEHICLE_NOT_FOUND"));
        return toDetail(v);
    }

    @Transactional
    @Override
    public VehicleDetailResponse create(String ownerId, VehicleCreateRequest req) {
        if (repo.existsByOwnerIdAndPlateNumber(ownerId, req.getPlateNumber())) {
            throw new IllegalArgumentException("PLATE_DUPLICATED");
        }

        CarOwnerVehicles v = CarOwnerVehicles.builder()
                .ownerId(ownerId)
                .plateNumber(req.getPlateNumber())
                .type(req.getType())
                .model(req.getModel())
                .capacity(req.getCapacity())
                .primary(false) // 먼저 false 저장
                .build();
        v = repo.save(v);

        if (req.isPrimary()) {
            setPrimary(ownerId, v.getId(), true);
            v = repo.findById(v.getId()).orElseThrow();
        }
        return toDetail(v);
    }

    @Transactional
    @Override
    public VehicleDetailResponse update(String ownerId, Long vehicleId, VehicleUpdateRequest req) {
    	CarOwnerVehicles v = repo.findByIdAndOwnerId(vehicleId, ownerId)
                .orElseThrow(() -> new NoSuchElementException("VEHICLE_NOT_FOUND"));

        if (req.getType() != null) v.setType(req.getType());
        if (req.getModel() != null) v.setModel(req.getModel());
        if (req.getCapacity() != null) v.setCapacity(req.getCapacity());

        return toDetail(v);
    }

    @Transactional
    @Override
    public VehicleDetailResponse setPrimary(String ownerId, Long vehicleId, boolean primary) {
    	CarOwnerVehicles target = repo.findByIdAndOwnerId(vehicleId, ownerId)
                .orElseThrow(() -> new NoSuchElementException("VEHICLE_NOT_FOUND"));

        if (primary) {
            repo.unsetPrimaryAll(ownerId); // 기존 기본 해제
            target.setPrimary(true);
        } else {
            target.setPrimary(false);
        }
        return toDetail(target);
    }

    @Transactional
    @Override
    public void delete(String ownerId, Long vehicleId) {
    	CarOwnerVehicles v = repo.findByIdAndOwnerId(vehicleId, ownerId)
                .orElseThrow(() -> new NoSuchElementException("VEHICLE_NOT_FOUND"));
        repo.delete(v);
    }

    // ====== mappers ======
    private VehicleSummaryResponse toSummary(CarOwnerVehicles v) {
        VehicleSummaryResponse dto = new VehicleSummaryResponse();
        dto.setId(v.getId());
        dto.setPlateNumber(v.getPlateNumber());
        dto.setType(v.getType());
        dto.setPrimary(v.isPrimary());
        dto.setStatus(v.getStatus());
        return dto;
    }

    private VehicleDetailResponse toDetail(CarOwnerVehicles v) {
        VehicleDetailResponse dto = new VehicleDetailResponse();
        dto.setId(v.getId());
        dto.setPlateNumber(v.getPlateNumber());
        dto.setType(v.getType());
        dto.setModel(v.getModel());
        dto.setCapacity(v.getCapacity());
        dto.setPrimary(v.isPrimary());
        dto.setStatus(v.getStatus());
        dto.setRegisteredAt(v.getRegisteredAt());
        return dto;
    }

}
