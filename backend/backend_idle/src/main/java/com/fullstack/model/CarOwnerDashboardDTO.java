package com.fullstack.model;

import lombok.*;

import java.util.List;

/**
 * 차주 대시보드 관련 DTO 모음
 */
public final class CarOwnerDashboardDTO {

    private CarOwnerDashboardDTO() {
        // 인스턴스화 방지
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CarOwnerDashDTO {
        private String name;
        private int completed;
        private int inProgress;
        private int scheduled;
        private int total;
        private long revenue;
        private int commission;
        private long settlement;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DashboardSummaryDTO {
        private String name;          // 차주 닉네임/표시명
        private int completed;        // 완료건
        private int inProgress;       // 진행중
        private int scheduled;        // 예정
        private int total;            // 총 운송건
        private long revenue;         // 이번달 매출 합
        private int commission;       // 수수료율(%)
        private long settlement;      // 정산 예정 금액
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DeliveryItemDTO {
        private String deliveryNum;     // 주문/운송 번호
        private String status;          // "배송중" 등
        private String transport_type;  // 화물 종류
        private String from;            // 출발지
        private String s_date;          // 출발 예정일
        private String to;              // 도착지
        private String date;            // 도착 예정일
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SalesChartDTO {
        private String day;        // yyyy-MM-dd
        private long sales;        // 해당일 매출
        private int deliveries;    // 해당일 운송건수
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class WarmthDTO {
        private int onTime;
        private int late;
    }
}