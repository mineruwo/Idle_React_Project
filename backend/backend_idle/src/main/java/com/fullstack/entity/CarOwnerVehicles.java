package com.fullstack.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "car_owner_vehicle",
       uniqueConstraints = {
           @UniqueConstraint(name = "uq_owner_plate", columnNames = {"owner_id", "plate_number"})
       },
       indexes = {
           @Index(name = "idx_vehicle_owner", columnList = "owner_id"),
           @Index(name = "idx_vehicle_primary", columnList = "owner_id,is_primary")
       })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CarOwnerVehicles {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="owner_id", nullable=false, length=50)
    private String ownerId;

    @Column(name="plate_number", nullable=false, length=20)
    private String plateNumber;

    @Column(name="type", length=30)
    private String type;

    @Column(name="model", length=30)
    private String model;

    @Column(name="capacity")
    private Integer capacity;

    @Column(name="is_primary", nullable=false)
    private boolean primary;

    @Column(name="status", length=20) // ACTIVE/INACTIVE
    private String status;

    @Column(name="registered_at", nullable=false)
    private LocalDateTime registeredAt;

    @PrePersist
    void prePersist() {
        if (status == null) status = "ACTIVE";
        if (registeredAt == null) registeredAt = LocalDateTime.now();
    }
}