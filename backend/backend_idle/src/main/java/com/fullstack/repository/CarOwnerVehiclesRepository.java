package com.fullstack.repository;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import com.fullstack.entity.CarOwnerVehiclesEntity;

import java.util.Optional;

public interface CarOwnerVehiclesRepository extends JpaRepository<CarOwnerVehiclesEntity, Long> {

    Page<CarOwnerVehiclesEntity> findByOwnerIdOrderByPrimaryDescIdDesc(String ownerId, Pageable pageable);

    Optional<CarOwnerVehiclesEntity> findByIdAndOwnerId(Long id, String ownerId);

    boolean existsByOwnerIdAndPlateNumber(String ownerId, String plateNumber);

    void deleteByIdAndOwnerId(Long id, String ownerId);

    // 기존 기본차량 해제(효율적 일괄 업데이트)
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update CarOwnerVehiclesEntity v set v.primary = false where v.ownerId = :ownerId and v.primary = true")
    int unsetPrimaryAll(@Param("ownerId") String ownerId);
}
