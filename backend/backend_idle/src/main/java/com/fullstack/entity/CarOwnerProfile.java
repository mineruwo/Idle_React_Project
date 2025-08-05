package com.fullstack.entity;

import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "car_owner")
public class CarOwnerProfile {
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String phone;
    private String businessNum;
    private String email;
    private String password;

    @OneToMany(mappedBy = "carOwner")
    private List<CarOwnerOrder> orders;

    @OneToMany(mappedBy = "carOwner")
    private List<CarOwnerSettlement> settlements;
}

