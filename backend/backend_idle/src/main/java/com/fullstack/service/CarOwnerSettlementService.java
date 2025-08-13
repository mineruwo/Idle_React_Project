package com.fullstack.service;


import org.springframework.data.domain.Page;
import com.fullstack.model.CarOwnerSettlementDTO.SettlementCreate;
import com.fullstack.model.CarOwnerSettlementDTO.SettlementDetailResponse;
import com.fullstack.model.CarOwnerSettlementDTO.SettlementSummaryCardResponse;
import com.fullstack.model.CarOwnerSettlementDTO.SettlementSummaryResponse;


import java.time.LocalDate;

public interface CarOwnerSettlementService {
    Page<SettlementSummaryResponse> list(String ownerId, int page, int size, String status, LocalDate from, LocalDate to);
    SettlementDetailResponse get(String ownerId, Long settlementId);
    SettlementDetailResponse create(String ownerId, SettlementCreate req);
    SettlementDetailResponse approve(String ownerId, Long settlementId, String memo);
    SettlementDetailResponse pay(String ownerId, Long settlementId, String txRef);
    SettlementDetailResponse cancel(String ownerId, Long settlementId, String memo);
    SettlementSummaryCardResponse summary(String ownerId);
}
