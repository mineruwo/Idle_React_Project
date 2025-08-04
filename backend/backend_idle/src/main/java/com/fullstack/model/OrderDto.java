package com.fullstack.model;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class OrderDto {
	 private String departure;
	    private String arrival;
	    private String cargoType;
	    private String cargoSize;
	    private String weight;
	    private String vehicle;
	    private boolean isImmediate;
	    private String reservedDate;
	    private String distance;
}
