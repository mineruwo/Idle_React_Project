package com.fullstack.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Builder;

@Entity
@Table(name = "TRANSFER_VEHICLE")
@Builder
public class TransferVehicle {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "ID_NUM", nullable = false)
	private Integer idNum;
	
	@Column(name = "TV_KEY", nullable = false)
	private String businessRegNum;
	
	@Column(name = "LICENSE_NUM", nullable = false)
	private String licenseNum;
	
	@Column(name = "CARGO_INSURANCE_NUM", nullable = false)
	private String cargoInsuranceNum;
}
