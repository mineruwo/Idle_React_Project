package com.fullstack.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalesSummaryDTO {
    private long totalMonthlyOrders;
    private long todayOrders;
    private double todayTransactionAmount;
    private double thisMonthTransactionAmount;
}
