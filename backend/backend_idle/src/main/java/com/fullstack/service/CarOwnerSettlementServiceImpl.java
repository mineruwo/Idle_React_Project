package com.fullstack.service;

import com.fullstack.entity.CarOwnerSettlement;
import com.fullstack.entity.CarOwnerSettlement.Status;
import com.fullstack.entity.CarOwnerSettlementBatch;
import com.fullstack.entity.OrderEntity;
import com.fullstack.model.CarOwnerSettlementDTO.SettlementDetailResponse;
import com.fullstack.model.CarOwnerSettlementDTO.SettlementSummaryCardResponse;
import com.fullstack.model.CarOwnerSettlementDTO.SettlementSummaryResponse;
import com.fullstack.model.enums.OrderStatus;
import com.fullstack.repository.CarOwnerSettlementBatchRepository;
import com.fullstack.repository.CarOwnerSettlementRepository;
import com.fullstack.repository.OrderRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CarOwnerSettlementServiceImpl implements CarOwnerSettlementService {

    private final CarOwnerSettlementRepository settlementRepo;
    private final CarOwnerSettlementBatchRepository batchRepo;
    private final OrderRepository orderRepo;
    
    @PersistenceContext
    private EntityManager em;

    private static final BigDecimal COMMISSION_RATE = new BigDecimal("0.05"); // 5%
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ISO_LOCAL_DATE;

    /* ===================== 목록/상세 ===================== */

    @Override
    public Page<SettlementSummaryResponse> list(
            String ownerId, LocalDate from, LocalDate to, Status status, int page, int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        LocalDateTime start = (from != null) ? from.atStartOfDay()
                : LocalDate.now().minusMonths(3).withDayOfMonth(1).atStartOfDay();
        LocalDateTime end = (to != null) ? to.plusDays(1).atStartOfDay() : LocalDateTime.now();

        Page<CarOwnerSettlement> p = (status == null)
                ? settlementRepo.findByOwnerIdAndCreatedAtBetween(ownerId, start, end, pageable)
                : settlementRepo.findByOwnerIdAndStatusAndCreatedAtBetween(ownerId, status, start, end, pageable);

        return p.map(this::toSummaryDTO);
    }



    @Override
    public SettlementDetailResponse getDetail(String ownerId, Long settlementId) {
        CarOwnerSettlement s = settlementRepo.findById(settlementId)
                .orElseThrow(() -> new IllegalArgumentException("SETTLEMENT_NOT_FOUND"));
        requireOwner(s, ownerId);
        return toDetailDTO(s);
    }

    /* ===================== 생성/동기화 ===================== */

    @Override
    @Transactional
    public Long createForOrder(String ownerId, Long orderId) {
        OrderEntity o = orderRepo.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("ORDER_NOT_FOUND"));

        // ownerId(문자열) ↔ assignedDriverId(Long) 최소 검증
        if (o.getAssignedDriverId() != null && !safeEqualsLongString(o.getAssignedDriverId(), ownerId)) {
            throw new IllegalArgumentException("ORDER_NOT_OWNED_BY_THIS_OWNER");
        }

        // 주문당 1개 제약
        if (settlementRepo.existsByOrderId(orderId)) {
            return settlementRepo.findIdByOrderId(orderId).orElseThrow();
        }

        // 산식/월키/배치
        BigDecimal amount = computeBaseAmount(o);
        BigDecimal commission = computeCommission(amount);
        LocalDate monthKey = resolveMonthKey(o);
        CarOwnerSettlementBatch batch = ensureBatch(ownerId, monthKey);

        CarOwnerSettlement s = new CarOwnerSettlement();
        s.setOrder(o);
        s.setOwnerId(ownerId);
        s.setAmount(amount);
        s.setCommission(commission);
        s.setStatus(Status.READY);
        s.setMonthKey(monthKey);
        s.setBatch(batch);
        s.setCreatedAt(LocalDateTime.now());
        s.setUpdatedAt(LocalDateTime.now());

        settlementRepo.save(s);

        // 배치 합계 갱신
        refreshBatchTotals(ownerId, monthKey);
        return s.getId();
    }

    @Override
    @Transactional
    public int syncMonthly(String ignored, YearMonth ym) {
        LocalDateTime start = ym.atDay(1).atStartOfDay();
        LocalDateTime end   = ym.atEndOfMonth().plusDays(1).atStartOfDay();

        var orders = orderRepo.findByStatusAndCreatedAtBetween(OrderStatus.COMPLETED, start, end);

        int created = 0;
        for (OrderEntity o : orders) {
            if (o.getAssignedDriverId() == null) continue;

            // 이미 정산 있으면 스킵
            if (settlementRepo.existsByOrderId(o.getId())) continue;

            // 누락된 것만 생성
            createForOrder(String.valueOf(o.getAssignedDriverId()), o.getId());
            created++;
        }
        return created;
    }

    /* ===================== 요약 카드 ===================== */
    @Override
    public SettlementSummaryCardResponse summaryCard(String ownerId, LocalDate from, LocalDate to) {
        LocalDateTime start = (from != null) ? from.atStartOfDay()
                : LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime end = (to != null) ? to.plusDays(1).atStartOfDay() : LocalDateTime.now();

        BigDecimal totalAmount = settlementRepo
                .sumAmountByOwnerAndCreatedAtBetween(ownerId, start, end);
        BigDecimal totalCommission = settlementRepo
                .sumCommissionByOwnerAndCreatedAtBetween(ownerId, start, end);
        long readyCnt = settlementRepo
                .countByOwnerIdAndStatusAndCreatedAtBetween(ownerId, Status.READY, start, end);
        long requestedCnt = settlementRepo
                .countByOwnerIdAndStatusAndCreatedAtBetween(ownerId, Status.REQUESTED, start, end);
        long paidCnt = settlementRepo
                .countByOwnerIdAndStatusAndCreatedAtBetween(ownerId, Status.PAID, start, end);

        BigDecimal net = safe(totalAmount).subtract(safe(totalCommission));

        return SettlementSummaryCardResponse.builder()
                .period(formatPeriod(start, end))
                .totalAmount(totalAmount)
                .totalCommission(totalCommission)
                .netAmount(net)
                .readyCount(readyCnt)
                .requestedCount(requestedCnt)
                .paidCount(paidCnt)
                .build();
    }

    /* ===================== private helpers ===================== */

    private SettlementSummaryResponse toSummaryDTO(CarOwnerSettlement s) {
        OrderEntity o = s.getOrder();
        BigDecimal net = safe(s.getAmount()).subtract(safe(s.getCommission()));
        return SettlementSummaryResponse.builder()
                .id(s.getId())
                .orderId(o != null ? o.getId() : null)
                .orderNo(o != null ? o.getOrderNo() : null)
                .departure(o != null ? o.getDeparture() : null)
                .arrival(o != null ? o.getArrival() : null)
                .amount(s.getAmount())
                .commission(s.getCommission())
                .netAmount(net)
                .status(s.getStatus().name())
                .createdAt(s.getCreatedAt())
                .paidAt(s.getPaidAt())
                .monthKey(s.getMonthKey())
                .build();
    }

    private SettlementDetailResponse toDetailDTO(CarOwnerSettlement s) {
        OrderEntity o = s.getOrder();
        BigDecimal net = safe(s.getAmount()).subtract(safe(s.getCommission()));
        return SettlementDetailResponse.builder()
                .id(s.getId())
                .ownerId(s.getOwnerId())
                .orderId(o != null ? o.getId() : null)
                .orderNo(o != null ? o.getOrderNo() : null)
                .departure(o != null ? o.getDeparture() : null)
                .arrival(o != null ? o.getArrival() : null)
                .amount(s.getAmount())
                .commission(s.getCommission())
                .netAmount(net)
                .status(s.getStatus().name())
                .requestedAt(s.getRequestedAt())
                .approvedAt(s.getApprovedAt())
                .paidAt(s.getPaidAt())
                .monthKey(s.getMonthKey())
                .createdAt(s.getCreatedAt())
                .updatedAt(s.getUpdatedAt())
                // txRef / batchId가 DTO에 있으면 여기에 매핑 (엔티티에 필드가 있을 때)
                .build();
    }

    private void requireOwner(CarOwnerSettlement s, String ownerId) {
        if (!Objects.equals(s.getOwnerId(), ownerId)) {
            throw new IllegalArgumentException("NO_AUTH_FOR_THIS_RESOURCE");
        }
    }

    private static boolean safeEqualsLongString(Long v, String s) {
        Long parsed = parseLongOrNull(s);
        return parsed != null && Objects.equals(v, parsed);
    }

    private static Long parseLongOrNull(String s) {
        if (s == null) return null;
        try { return Long.parseLong(s); } catch (NumberFormatException e) { return null; }
    }

    private BigDecimal computeBaseAmount(OrderEntity o) {
        if (o.getDriverPrice() != null) return BigDecimal.valueOf(o.getDriverPrice());
        if (o.getProposedPrice() != null) return BigDecimal.valueOf(o.getProposedPrice().longValue());
        if (o.getAvgPrice() != null) return BigDecimal.valueOf(o.getAvgPrice());
        return BigDecimal.ZERO;
    }

    private BigDecimal computeCommission(BigDecimal baseAmount) {
        return safe(baseAmount).multiply(COMMISSION_RATE).setScale(0, RoundingMode.HALF_UP);
    }

    private LocalDate resolveMonthKey(OrderEntity o) {
        LocalDate basis;
        if (o.getStatus() == OrderStatus.COMPLETED && o.getUpdatedAt() != null) {
            basis = o.getUpdatedAt().toLocalDate();
        } else {
            LocalDate byReserved = parseLocalDateOrNull(o.getReservedDate());
            if (byReserved != null) basis = byReserved;
            else basis = (o.getCreatedAt() != null) ? o.getCreatedAt().toLocalDate() : LocalDate.now();
        }
        return YearMonth.from(basis).atDay(1);
    }

    private static LocalDate parseLocalDateOrNull(String s) {
        if (s == null || s.isBlank()) return null;
        try { return LocalDate.parse(s, DATE_FMT); } catch (Exception e) { return null; }
    }

    private static BigDecimal safe(BigDecimal v) { return v != null ? v : BigDecimal.ZERO; }

    private static String formatPeriod(LocalDateTime start, LocalDateTime endExclusive) {
        LocalDate s = start.toLocalDate();
        LocalDate e = endExclusive.minusSeconds(1).toLocalDate();
        return s + " ~ " + e;
    }

    /* ===== 배치 보장/집계 ===== */

    @Transactional // ← 가능하면 public 메서드에서
    public CarOwnerSettlementBatch ensureBatch(String ownerId, LocalDate monthKey) {
        return batchRepo.findByOwnerIdAndMonthKey(ownerId, monthKey)
            .orElseGet(() -> {
                try {
                    CarOwnerSettlementBatch b = new CarOwnerSettlementBatch();
                    b.setOwnerId(ownerId);
                    b.setMonthKey(monthKey);
                    b.setStatus(CarOwnerSettlementBatch.Status.REQUESTED); // 권장: READY
                    return batchRepo.saveAndFlush(b);
                } catch (DataIntegrityViolationException /*| ConstraintViolationException*/ ex) {
                    // flush 실패 → 1차 캐시 정리
                    em.clear();
                    // 이미 다른 트랜잭션이 만든 케이스
                    return batchRepo.findByOwnerIdAndMonthKey(ownerId, monthKey)
                        .orElseThrow(() -> new IllegalStateException(
                            "Batch was inserted concurrently but not found"));
                }
            });
    }
    
    @Transactional
    protected void refreshBatchTotals(String ownerId, LocalDate monthKey) {
        BigDecimal net = Optional.ofNullable(
                settlementRepo.sumNetByOwnerAndMonthKeyForRequested(ownerId, monthKey))
            .orElse(BigDecimal.ZERO)
            .setScale(0, RoundingMode.HALF_UP);

        int cnt = (int) settlementRepo.countByOwnerIdAndMonthKeyAndStatus(
                ownerId, monthKey, CarOwnerSettlement.Status.REQUESTED);

        var opt = batchRepo.findByOwnerIdAndMonthKey(ownerId, monthKey);
        if (opt.isPresent()) {
            var b = opt.get();
            b.setTotalAmount(net);
            b.setItemCount(cnt);
            batchRepo.save(b);
        }
    }
    
    @Transactional
    public void requestPayoutBatch(String ownerId, YearMonth ym, String bankCode, String accountNo) {
        LocalDate monthKey = ym.atDay(1);

        var b = batchRepo.findByOwnerIdAndMonthKey(ownerId, monthKey)
                .orElseThrow(() -> new IllegalArgumentException("BATCH_NOT_FOUND"));
        if (b.getStatus() != CarOwnerSettlementBatch.Status.REQUESTED) {
            throw new IllegalStateException("BATCH_NOT_OPEN");
        }

        // 1) READY → REQUESTED (항목)
        settlementRepo.bulkMarkRequested(ownerId, monthKey);

        // 2) 배치에 은행/계좌 저장
        b.setBankCode(bankCode);
        b.setBankAccountNo(accountNo);
        b.setRequestedAt(LocalDateTime.now());
        // b.setStatus(...)는 이미 REQUESTED 상태 유지

        // 3) 합계/건수 재계산
        refreshBatchTotals(ownerId, monthKey);

        batchRepo.save(b);
    }

	
		
	
}