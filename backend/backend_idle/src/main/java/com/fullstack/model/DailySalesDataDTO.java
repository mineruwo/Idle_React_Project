package com.fullstack.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DailySalesDataDTO {
    private LocalDate date;
    private long orderCount;
    private double totalAmount;
    private double totalCommission;
}
