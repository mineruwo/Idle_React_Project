package com.fullstack.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "TRANSPORT_AUTH")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class TransportAuth {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(name= "CAR_NUM", nullable = true)
	private String carNum;
	
	@Column(name = "ID_NUM", nullable = false)
	private Integer idNum;
	
	@Column(name = "CAR_TYPE", nullable = false)
	private String carType;
	
	@Column(name = "CAR_INSURANCE_STATUS", nullable = false)
	private Boolean carInsuranceStatus;
	
	@Column(name = "GETORDER")
	private Long getOrder;
	
	@OneToOne
	@JoinColumn(name = "vehicle_id")
	private TransferVehicle vehicle;
	
	@OneToOne(mappedBy = "transportAuth", cascade = CascadeType.ALL)
	private BusinessLicense businessLicense;

	@OneToOne(mappedBy = "transportAuth", cascade = CascadeType.ALL)
	private DriverLicense driverLicense;
}
