package com.fullstack.service;

import org.springframework.stereotype.Component;

/** 운임/입찰가 계산 정책(프론트 하한가 로직을 서버로 이관) */
@Component
public class PricingPolicy {

    // OrderForm과 동일하게 맞춰주세요
    private static final int AVERAGE_PRICE_PER_KM = 3000; // 원/km
    private static final double MIN_BID_RATE = 0.60;      // 평균가의 60%

    /** 기준가: avgPrice > (distance*단가) > proposedPrice 순서로 사용 */
    public int basePriceFor(Double distanceKm, Integer avgPrice, Integer proposedPrice) {
        if (avgPrice != null && avgPrice > 0) return avgPrice;
        if (distanceKm != null && distanceKm > 0) {
            return (int) Math.round(distanceKm * AVERAGE_PRICE_PER_KM);
        }
        return proposedPrice != null ? proposedPrice : 0;
    }

    /** 기사 입찰 하한가(최소 제안가) */
    public int minDriverBid(Double distanceKm, Integer avgPrice, Integer proposedPrice) {
        int base = basePriceFor(distanceKm, avgPrice, proposedPrice);
        return Math.max(0, (int) Math.floor(base * MIN_BID_RATE));
    }
}

