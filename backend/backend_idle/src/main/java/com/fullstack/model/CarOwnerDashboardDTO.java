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
        private String nickname;
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
        private Long id;             // ★ 엔티티 id (프론트 액션에 필수)
        private String deliveryNum;  // 화면 표기용 번호 (id 문자열)
        private String status;       // CREATED/ONGOING/COMPLETED/CANCELED (enum name)
        private String transport_type;
        private String from;
        private String s_date;       // 출발 예정일(문자열)
        private String to;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SalesChartDTO {
        private String day;        // yyyy-MM-dd
        private long sales;        // 해당일 매출
        private Long deliveries;    // 해당일 운송건수
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WarmthDTO {
        private Integer score;       // 0~100, null = 없음
        private Integer reviewCount; // 리뷰 개수
        private Double  avgRating;   // 1~5, null = 없음
    }
}