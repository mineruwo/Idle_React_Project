package com.fullstack.service;

import com.fullstack.model.DailySalesDataDTO;
import com.fullstack.model.SalesSummaryDTO;
import com.fullstack.model.CarOwnerSettlementBatchDTO;
import com.fullstack.repository.OrderRepository;
import com.fullstack.repository.CarOwnerSettlementRepository;
import com.fullstack.repository.CarOwnerSettlementBatchRepository;
import com.fullstack.entity.Order;
import com.fullstack.entity.CarOwnerSettlement;
import com.fullstack.entity.CarOwnerSettlementBatch;
import com.fullstack.model.enums.OrderStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
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

    @Autowired
    private CarOwnerSettlementBatchRepository carOwnerSettlementBatchRepository;

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
                            .map(this::calculateCommission)
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
            // CarOwnerSettlement settlement = carOwnerSettlementRepository.findById(order.getAssignedDriverId()).orElse(null);
            // if (settlement != null) {
            //     commissionRate = settlement.getCommission();
            // }
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

    // New methods for CarOwnerSettlementBatch
    public Page<CarOwnerSettlementBatchDTO.BatchSummaryResponse> getCarOwnerSettlementBatches(
            Pageable pageable, String ownerId, String yearMonth, String status) {
        Specification<CarOwnerSettlementBatch> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (ownerId != null && !ownerId.isEmpty()) {
                predicates.add(cb.equal(root.get("ownerId"), ownerId));
            }
            if (yearMonth != null && !yearMonth.isEmpty()) {
                // Assuming yearMonth is in "YYYY-MM" format
                // Convert yearMonth to LocalDate (first day of the month)
                LocalDate monthStart = LocalDate.parse(yearMonth + "-01");
                LocalDate monthEnd = monthStart.with(TemporalAdjusters.lastDayOfMonth());
                predicates.add(cb.between(root.get("monthKey"), monthStart, monthEnd));
            }
            if (status != null && !status.isEmpty()) {
                try {
                    CarOwnerSettlementBatch.Status enumStatus = CarOwnerSettlementBatch.Status.valueOf(status);
                    predicates.add(cb.equal(root.get("status"), enumStatus));
                } catch (IllegalArgumentException e) {
                    // Handle invalid status string, e.g., log or throw specific exception
                    // For now, just ignore invalid status to avoid breaking the query
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<CarOwnerSettlementBatch> batches = carOwnerSettlementBatchRepository.findAll(spec, pageable);
        return batches.map(this::convertToBatchSummaryResponseDTO);
    }

    public CarOwnerSettlementBatchDTO.BatchDetailResponse getCarOwnerSettlementBatchDetails(Long id) {
        CarOwnerSettlementBatch batch = carOwnerSettlementBatchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Settlement Batch not found with id: " + id));
        return convertToBatchDetailResponseDTO(batch);
    }

    @Transactional
    public CarOwnerSettlementBatchDTO.BatchSummaryResponse updateCarOwnerSettlementStatus(Long id, String newStatus) {
        CarOwnerSettlementBatch batch = carOwnerSettlementBatchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Settlement Batch not found with id: " + id));

        // Update status
        try {
            batch.setStatus(CarOwnerSettlementBatch.Status.valueOf(newStatus));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + newStatus);
        }
        
        CarOwnerSettlementBatch updatedBatch = carOwnerSettlementBatchRepository.save(batch);
        return convertToBatchSummaryResponseDTO(updatedBatch);
    }

    private CarOwnerSettlementBatchDTO.BatchSummaryResponse convertToBatchSummaryResponseDTO(CarOwnerSettlementBatch batch) {
        // Derive yearMonth from monthKey
        String yearMonth = batch.getMonthKey() != null ? batch.getMonthKey().format(DateTimeFormatter.ofPattern("yyyy-MM")) : null;

        // Placeholder/derived values for counts and amounts not directly in batch entity
        // In a real scenario, these would be calculated from associated CarOwnerSettlement records
        long readyCount = 0L; // Placeholder
        long requestedCount = 0L; // Placeholder
        long paidCount = 0L; // Placeholder
        BigDecimal totalCommission = BigDecimal.ZERO; // Placeholder
        BigDecimal netAmount = batch.getTotalAmount(); // Placeholder, assuming no commission for now

        // Use requestedAt for createdAt, and null for updatedAt if not directly available
        LocalDateTime createdAt = batch.getRequestedAt();
        LocalDateTime updatedAt = null; // Or derive from other timestamps if applicable

        return CarOwnerSettlementBatchDTO.BatchSummaryResponse.builder()
                .id(batch.getId())
                .ownerId(batch.getOwnerId())
                .yearMonth(yearMonth)
                .monthKey(batch.getMonthKey())
                .totalAmount(batch.getTotalAmount())
                .totalCommission(totalCommission)
                .netAmount(netAmount)
                .readyCount(readyCount)
                .requestedCount(requestedCount)
                .paidCount(paidCount)
                .createdAt(createdAt)
                .updatedAt(updatedAt)
                .status(batch.getStatus().name())
                .build();
    }

    private CarOwnerSettlementBatchDTO.BatchDetailResponse convertToBatchDetailResponseDTO(CarOwnerSettlementBatch batch) {
        // Derive yearMonth from monthKey
        String yearMonth = batch.getMonthKey() != null ? batch.getMonthKey().format(DateTimeFormatter.ofPattern("yyyy-MM")) : null;

        // Placeholder/derived values for counts and amounts not directly in batch entity
        long readyCount = 0L; // Placeholder
        long requestedCount = 0L; // Placeholder
        long paidCount = 0L; // Placeholder
        BigDecimal totalCommission = BigDecimal.ZERO; // Placeholder
        BigDecimal netAmount = batch.getTotalAmount(); // Placeholder, assuming no commission for now

        // Use requestedAt for createdAt, and null for updatedAt if not directly available
        LocalDateTime createdAt = batch.getRequestedAt();
        LocalDateTime updatedAt = null; // Or derive from other timestamps if applicable

        return CarOwnerSettlementBatchDTO.BatchDetailResponse.builder()
                .id(batch.getId())
                .ownerId(batch.getOwnerId())
                .yearMonth(yearMonth)
                .monthKey(batch.getMonthKey())
                .totalAmount(batch.getTotalAmount())
                .totalCommission(totalCommission)
                .netAmount(netAmount)
                .readyCount(readyCount)
                .requestedCount(requestedCount)
                .paidCount(paidCount)
                .createdAt(createdAt)
                .updatedAt(updatedAt)
                .items(null) // This needs to be populated with actual settlement items if available
                .status(batch.getStatus().name())
                .build();
    }
}