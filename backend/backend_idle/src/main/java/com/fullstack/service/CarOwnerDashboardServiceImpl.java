package com.fullstack.service;

import com.fullstack.model.CarOwnerDashboardDTO;
import com.fullstack.model.CarOwnerDashboardDTO.RecentOrderItem;
import com.fullstack.model.CarOwnerDashboardDTO.RecentSettlementItem;
import com.fullstack.model.CarOwnerOrderListDTO;
import com.fullstack.repository.CarOwnerOrderListRepository;
import com.fullstack.entity.CarOwnerOrderList;
import com.fullstack.entity.CarOwnerOrderList.Status;
import com.fullstack.entity.CarOwnerSettlement;
import com.fullstack.repository.CarOwnerSettlementRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CarOwnerDashboardServiceImpl implements CarOwnerDashboardService {

    private final CarOwnerOrderListRepository orderRepository;
    private final CarOwnerSettlementRepository settlementRepository;

    @Transactional(readOnly = true)
    @Override
    public CarOwnerDashboardDTO getDashboard(String ownerId) {

        LocalDate today = LocalDate.now();
        LocalDateTime startOfToday = today.atStartOfDay();
        LocalDateTime startOfMonth = today.withDayOfMonth(1).atStartOfDay();

        long totalOrders       = orderRepository.countByOwnerId(ownerId);
        long ongoingOrders     = orderRepository.countByOwnerIdAndStatus(ownerId, Status.ONGOING);
        long completedToday    = orderRepository.countByOwnerIdAndStatusAndUpdatedAtBetween(
                ownerId, Status.COMPLETED, startOfToday, LocalDateTime.now());
        long canceledThisMonth = orderRepository.countByOwnerIdAndStatusAndUpdatedAtBetween(
                ownerId, Status.CANCELED, startOfMonth, LocalDateTime.now());

        // 정산(정책에 따라 완료건 합계 or 정산 테이블 합계)
        long todayEarnings   = settlementRepository.sumAmountByOwnerIdAndCreatedAtBetween(
                ownerId, startOfToday, LocalDateTime.now());
        long monthEarnings   = settlementRepository.sumAmountByOwnerIdAndCreatedAtBetween(
                ownerId, startOfMonth, LocalDateTime.now());
        long unsettledAmount = settlementRepository.sumUnsettledAmountByOwnerId(ownerId);

        var recentOrders = orderRepository.findTop5ByOwnerIdOrderByUpdatedAtDesc(ownerId)
                .stream().map(this::toRecentOrder).collect(Collectors.toList());

        var recentSettlements = settlementRepository.findTop5ByOwnerIdOrderByCreatedAtDesc(ownerId)
                .stream().map(this::toRecentSettlement).collect(Collectors.toList());

        CarOwnerDashboardDTO dto = new CarOwnerDashboardDTO();
        dto.setTotalOrders(totalOrders);
        dto.setOngoingOrders(ongoingOrders);
        dto.setCompletedToday(completedToday);
        dto.setCanceledThisMonth(canceledThisMonth);
        dto.setTodayEarnings(todayEarnings);
        dto.setMonthEarnings(monthEarnings);
        dto.setUnsettledAmount(unsettledAmount);
        dto.setRecentOrders(recentOrders);
        dto.setRecentSettlements(recentSettlements);
        dto.setUnreadNotifications(0); // 알림 시스템 붙이면 교체
        return dto;
    }

    private RecentOrderItem toRecentOrder(CarOwnerOrderList o) {
        RecentOrderItem r = new RecentOrderItem();
        r.setOrderId(o.getId());
        r.setStatus( o.getStatus() != null ? o.getStatus().name() : null );
        r.setCargoType(o.getCargoType());
        r.setRoute(o.getDeparture() + "→" + o.getArrival());
        r.setPrice(o.getFinalPrice()); // 혹은 proposedPrice
        r.setUpdatedAt(o.getUpdatedAt());
        return r;
    }

    private RecentSettlementItem toRecentSettlement(CarOwnerSettlement s) {
        RecentSettlementItem r = new RecentSettlementItem();
        r.setSettlementId(s.getId());
        r.setAmount(s.getAmount());
        r.setStatus(s.getStatus() != null ? s.getStatus().name() : null);
        r.setCreatedAt(s.getCreatedAt());
        return r;
    }
}
