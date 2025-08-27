package com.fullstack.service;

import com.fullstack.model.DailySalesDataDTO;
import com.fullstack.model.SalesSummaryDTO;
import com.fullstack.repository.OrderRepository;
import com.fullstack.repository.CarOwnerSettlementRepository;
import com.fullstack.entity.Order;
import com.fullstack.entity.CarOwnerSettlement;
import com.fullstack.model.enums.OrderStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.Comparator;

@Service
public class SalesService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CarOwnerSettlementRepository carOwnerSettlementRepository;

    public List<DailySalesDataDTO> getDailySalesData(LocalDate startDate, LocalDate endDate) {
        List<Order> orders = orderRepository.findByCreatedAtBetween(
                startDate.atStartOfDay(),
                endDate.atTime(LocalTime.MAX)
        );

        // Filter orders based on status (payment_pending or later, excluding cancel, none)
        List<Order> filteredOrders = orders.stream()
                .filter(order -> {
                    OrderStatus status = order.getStatus();
                    return status != null &&
                            (status == OrderStatus.PAYMENT_PENDING ||
                             status == OrderStatus.COMPLETED ||
                             status == OrderStatus.ONGOING); // Add other relevant statuses
                })
                .collect(Collectors.toList());

        Map<LocalDate, List<Order>> ordersByDate = filteredOrders.stream()
                .collect(Collectors.groupingBy(order -> order.getCreatedAt().toLocalDate()));

        return ordersByDate.entrySet().stream()
                .map(entry -> {
                    LocalDate date = entry.getKey();
                    List<Order> dailyOrders = entry.getValue();

                    long orderCount = dailyOrders.size();
                    BigDecimal totalAmount = dailyOrders.stream()
                            .map(order -> order.getDriverPrice() != null ? new BigDecimal(order.getDriverPrice()) : BigDecimal.ZERO)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    BigDecimal totalCommission = dailyOrders.stream()
                            .map(order -> calculateCommission(order))
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    return new DailySalesDataDTO(date, orderCount, totalAmount.doubleValue(), totalCommission.doubleValue());
                })
                .sorted(Comparator.comparing(DailySalesDataDTO::getDate))
                .collect(Collectors.toList());
    }

    private BigDecimal calculateCommission(Order order) {
        BigDecimal driverPrice = order.getDriverPrice() != null ? new BigDecimal(order.getDriverPrice()) : BigDecimal.ZERO;
        BigDecimal commissionRate = BigDecimal.valueOf(0.15); // Default commission rate

        if (order.getAssignedDriverId() != null) {
            CarOwnerSettlement settlement = carOwnerSettlementRepository.findById(order.getAssignedDriverId()).orElse(null);
            if (settlement != null && settlement.getTxRef() != null) {
                try {
                    commissionRate = new BigDecimal(settlement.getTxRef());
                } catch (NumberFormatException e) {
                    // Log error or handle invalid tx_ref format
                    System.err.println("Invalid tx_ref format for settlement ID " + settlement.getId() + ": " + settlement.getTxRef());
                }
            }
        }
        return driverPrice.multiply(commissionRate);
    }

    public SalesSummaryDTO getSalesSummary() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfToday = today.atStartOfDay();
        LocalDateTime endOfToday = today.atTime(LocalTime.MAX);

        LocalDate firstDayOfMonth = today.with(TemporalAdjusters.firstDayOfMonth());
        LocalDateTime startOfMonth = firstDayOfMonth.atStartOfDay();
        LocalDateTime endOfMonth = today.with(TemporalAdjusters.lastDayOfMonth()).atTime(LocalTime.MAX);

        // Today's orders
        List<Order> todayOrders = orderRepository.findByCreatedAtBetween(startOfToday, endOfToday);
        List<Order> filteredTodayOrders = todayOrders.stream()
                .filter(order -> {
                    OrderStatus status = order.getStatus();
                    return status != null &&
                            (status == OrderStatus.PAYMENT_PENDING ||
                             status == OrderStatus.COMPLETED ||
                             status == OrderStatus.ONGOING);
                })
                .collect(Collectors.toList());

        long todayOrderCount = filteredTodayOrders.size();
        BigDecimal todayTransactionAmount = filteredTodayOrders.stream()
                .map(order -> order.getDriverPrice() != null ? new BigDecimal(order.getDriverPrice()) : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // This month's orders
        List<Order> thisMonthOrders = orderRepository.findByCreatedAtBetween(startOfMonth, endOfMonth);
        List<Order> filteredThisMonthOrders = thisMonthOrders.stream()
                .filter(order -> {
                    OrderStatus status = order.getStatus();
                    return status != null &&
                            (status == OrderStatus.PAYMENT_PENDING ||
                             status == OrderStatus.COMPLETED ||
                             status == OrderStatus.ONGOING);
                })
                .collect(Collectors.toList());

        long totalMonthlyOrders = filteredThisMonthOrders.size();
        BigDecimal thisMonthTransactionAmount = filteredThisMonthOrders.stream()
                .map(order -> order.getDriverPrice() != null ? new BigDecimal(order.getDriverPrice()) : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new SalesSummaryDTO(
                totalMonthlyOrders,
                todayOrderCount,
                todayTransactionAmount.doubleValue(),
                thisMonthTransactionAmount.doubleValue()
        );
    }
}
