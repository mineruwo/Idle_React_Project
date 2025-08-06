package com.fullstack.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderDto {

    private String date;
    private String packingOptions;
	private String departure;
    private String arrival;
	private String cargoType;
	private String cargoSize;
	private String weight;
	private String vehicle;
	private boolean isImmediate;
	private String reservedDate;
	private Double distance;
}
