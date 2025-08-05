package com.fullstack.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderDto {

    private String departure;
    private String arrival;
    private double distance;
    private String date;
    private boolean isImmediate;
    private int weight;
    private String vehicle;
    private String cargoType;
    private String cargoSize;
    private String packingOptions;
}
