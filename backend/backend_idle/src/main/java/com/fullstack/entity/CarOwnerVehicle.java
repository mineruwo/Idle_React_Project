package com.fullstack.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "registered_vehicle")
public class CarOwnerVehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String carNum;
    private String carType;
    private String tonType;
    private String coldType;
    private String carLength;
    private Boolean isMain;
    private Boolean isOwned;

    @ManyToOne
    @JoinColumn(name = "car_owner_id")
    private CarOwnerProfile carOwner;
}
