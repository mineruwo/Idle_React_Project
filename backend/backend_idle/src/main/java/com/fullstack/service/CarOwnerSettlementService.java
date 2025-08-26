package com.fullstack.service;

import com.fullstack.model.CarOwnerSettlementDTO.SettlementCreate;
import com.fullstack.model.CarOwnerSettlementDTO.SettlementDetailResponse;
import com.fullstack.model.CarOwnerSettlementDTO.SettlementMemoRequest;
import com.fullstack.model.CarOwnerSettlementDTO.SettlementPayRequest;
import com.fullstack.model.CarOwnerSettlementDTO.SettlementSummaryCardResponse;
import com.fullstack.model.CarOwnerSettlementDTO.SettlementSummaryResponse;
import org.springframework.data.domain.Page;

public interface CarOwnerSettlementService {

    Page<SettlementSummaryResponse> list(String ownerId, String status, String from, String to, int page, int size);

    SettlementDetailResponse get(String ownerId, Long id);

    SettlementDetailResponse create(String ownerId, SettlementCreate req); // (월 자동 동기화 + 수동 추가 병행 가능)

    SettlementDetailResponse approve(String ownerId, Long id, SettlementMemoRequest memo);

    SettlementDetailResponse pay(String ownerId, Long id, SettlementPayRequest req);

    SettlementDetailResponse cancel(String ownerId, Long id, SettlementMemoRequest memo);

    SettlementSummaryCardResponse summary(String ownerId);
}