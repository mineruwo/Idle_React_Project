package com.fullstack.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DashboardDTO {
    private int completed;
    private int inProgress;
    private int scheduled;
    private int total;
    private int proposedPrice;
    private double commissionRate;
}