package com.fullstack.model;


import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Getter
@Setter
public class CarOwnerDashboardDTO {
    // 상단 카드용
    private long totalOrders;         // 전체 주문 수
    private long ongoingOrders;       // 진행 중
    private long completedToday;      // 오늘 완료
    private long canceledThisMonth;   // 이달 취소

    private long unreadNotifications; // 선택: 알림수

    // 정산 요약
    private long todayEarnings;       // 오늘 수익(정산완료/완료예정 기준 팀 정책)
    private long monthEarnings;       // 이달 수익
    private long unsettledAmount;     // 미정산 금액

    // 하단 리스트용
    private List<RecentOrderItem> recentOrders;          // 최근 주문 5건
    private List<RecentSettlementItem> recentSettlements;// 최근 정산 5건

    @Data
    public static class RecentOrderItem {
        private Long orderId;
        private String status;         // CREATED, ONGOING, COMPLETED...
        private String cargoType;
        private String route;          // ex) "서울→부산"
        private Integer price;         // 제안가/확정가
        private LocalDateTime updatedAt;
    }

    @Data
    public static class RecentSettlementItem {
        private Long settlementId;
        private Integer amount;
        private String status;         // REQUESTED, PAID, HOLD...
        private LocalDateTime createdAt;
    }
}