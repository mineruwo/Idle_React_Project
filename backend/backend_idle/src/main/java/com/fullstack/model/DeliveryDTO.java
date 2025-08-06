package com.fullstack.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DeliveryDTO {
	private String deliveryNum;
	private String status;
	private String transportType;
	private String from;
	private String sDate;
	private String to;
	private String date;
	
}
