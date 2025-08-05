package com.fullstack.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "TRANSPORT_AUTH")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransportAuth {
	
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	
	@Column(name= "CAR_NUM", nullable = false)
	private String carNum;
	
	@Column(name = "ID_NUM", nullable = false)
	private Integer idNum;
	
	@Column(name = "CAR_TYPE", nullable = false)
	private String carType;
	
	@Column(name = "CAR_INSURANCE_STATUS", nullable = false)
	private Boolean carInsuranceStatus;
}
