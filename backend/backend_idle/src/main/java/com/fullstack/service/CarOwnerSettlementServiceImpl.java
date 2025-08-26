package com.fullstack.service;

import com.fullstack.entity.CarOwnerSettlement;
import com.fullstack.entity.CarOwnerSettlementBatch;
import com.fullstack.entity.Order;

import com.fullstack.model.CarOwnerSettlementDTO.SettlementCreate;
import com.fullstack.model.CarOwnerSettlementDTO.SettlementDetailResponse;
import com.fullstack.model.CarOwnerSettlementDTO.SettlementMemoRequest;
import com.fullstack.model.CarOwnerSettlementDTO.SettlementPayRequest;
import com.fullstack.model.CarOwnerSettlementDTO.SettlementSummaryCardResponse;
import com.fullstack.model.CarOwnerSettlementDTO.SettlementSummaryResponse;
import com.fullstack.model.enums.OrderStatus;
import com.fullstack.repository.CarOwnerSettlementBatchRepository;
import com.fullstack.repository.CarOwnerSettlementRepository;
import com.fullstack.repository.OrderRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CarOwnerSettlementServiceImpl implements CarOwnerSettlementService {

    private final CarOwnerSettlementRepository itemRepo;
    private final CarOwnerSettlementBatchRepository batchRepo;
    private final OrderRepository orderRepo;

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");

    private static LocalDate firstOfMonth(String yyyyMmDd) {
        return (yyyyMmDd == null || yyyyMmDd.isBlank())
                ? null
                : LocalDate.parse(yyyyMmDd).withDayOfMonth(1);
    }

    private static LocalDate nextMonthFirst(LocalDate monthFirstOrNull) {
        return monthFirstOrNull == null ? null : monthFirstOrNull.plusMonths(1);
    }

    private SettlementSummaryResponse toSummary(CarOwnerSettlement s) {
        return SettlementSummaryResponse.builder()
                .id(s.getId())
                .orderId(s.getOrderId())
                .amount(s.getAmount())
                .status(s.getBatch().getStatus().name())
                .requestedAt(s.getBatch().getRequestedAt())
                .build();
    }

    private SettlementDetailResponse toDetail(CarOwnerSettlement s) {
        return SettlementDetailResponse.builder()
                .id(s.getId())
                .ownerId(s.getOwnerId())
                .orderId(s.getOrderId())
                .amount(s.getAmount())
                .status(s.getBatch().getStatus().name())
                .memo(s.getMemo())
                .txRef(s.getTxRef())
                .requestedAt(s.getBatch().getRequestedAt())
                .paidAt(s.getBatch().getPaidAt())
                .build();
    }

    /** 월 배치 가져오거나 생성 */
    private CarOwnerSettlementBatch getOrCreateBatch(String ownerId, LocalDate monthKey) {
    	CarOwnerSettlementBatchRepository b = batchRepo.findByOwnerIdAndMonthKey(ownerId, monthKey);
        if (b == null) {
            b = CarOwnerSettlementBatchRepository.builder()
                    .ownerId(ownerId)
                    .monthKey(monthKey)
                    .status(CarOwnerSettlementBatch.Status.REQUESTED)
                    .totalAmount(0L)
                    .itemCount(0)
                    .build();
            b = batchRepo.save(b);
        }
        return b;
    }

    /** 주문을 아이템으로 추가 (driverPrice 사용) */
    private CarOwnerSettlement addOrderToBatch(String ownerId, CarOwnerSettlementBatch batch, Order o) {
        long amt = o.getDriverPrice() != null ? o.getDriverPrice() : 0L;
        CarOwnerSettlement item = CarOwnerSettlement.builder()
                .ownerId(ownerId)
                .orderId(o.getId())
                .amount(amt)
                .batch(batch)
                .build();
        try {
            item = itemRepo.save(item);
            batch.setTotalAmount(batch.getTotalAmount() + amt);
            batch.setItemCount(batch.getItemCount() + 1);
            return item;
        } catch (DataIntegrityViolationException dup) {
            // order_id UNIQUE → 이미 포함된 경우는 무시하고 해당 아이템을 다시 조회
            return itemRepo.findAll().stream()
                    .filter(s -> s.getOrderId().equals(o.getId()) && s.getOwnerId().equals(ownerId))
                    .findFirst()
                    .orElseThrow();
        }
    }

    /** 목록 */
    @Transactional(readOnly = true)
    @Override
    public Page<SettlementSummaryResponse> list(String ownerId, String status, String from, String to, int page, int size) {
        LocalDate fromMonth = firstOfMonth(from);             // yyyy-MM-dd → 해당 월 1일
        LocalDate toMonth   = firstOfMonth(to);
        LocalDate toNext    = nextMonthFirst(toMonth);

        Page<CarOwnerSettlement> p = itemRepo.search(ownerId,
                (status == null || status.isBlank()) ? null : status,
                fromMonth,
                toNext,
                PageRequest.of(page, size));

        return p.map(this::toSummary);
    }

    /** 단건 조회 */
    @Transactional(readOnly = true)
    @Override
    public SettlementDetailResponse get(String ownerId, Long id) {
    	CarOwnerSettlement s = itemRepo.findOneForOwner(id, ownerId);
        if (s == null) throw new IllegalArgumentException("SETTLEMENT_NOT_FOUND");
        return toDetail(s);
    }

    /** 생성 (수동 아이템 추가) */
    @Transactional
    @Override
    public SettlementDetailResponse create(String ownerId, SettlementCreate req) {
        if (req.getOrderId() == null) throw new IllegalArgumentException("ORDER_ID_REQUIRED");
        Order o = orderRepo.findById(req.getOrderId())
                .orElseThrow(() -> new IllegalArgumentException("ORDER_NOT_FOUND"));

        // 차주 본인 소유 검증 (ownerId ↔ assignedDriverId)
        Long driverId = tryParseLong(ownerId);
        if (driverId != null && o.getAssignedDriverId() != null && !o.getAssignedDriverId().equals(driverId)) {
            throw new IllegalStateException("FORBIDDEN");
        }
        if (o.getStatus() != OrderStatus.COMPLETED) {
            throw new IllegalStateException("ORDER_NOT_COMPLETED");
        }

        LocalDate monthKey = o.getUpdatedAt().withDayOfMonth(1).toLocalDate();
        CarOwnerSettlementBatch batch = getOrCreateBatch(ownerId, monthKey);

        CarOwnerSettlement item = addOrderToBatch(ownerId, batch, o);
        if (req.getMemo() != null) item.setMemo(req.getMemo());

        return toDetail(item);
    }

    /** 승인 */
    @Transactional
    @Override
    public SettlementDetailResponse approve(String ownerId, Long id, SettlementMemoRequest memo) {
    	CarOwnerSettlement s = itemRepo.findOneForOwner(id, ownerId);
        if (s == null) throw new IllegalArgumentException("SETTLEMENT_NOT_FOUND");
        CarOwnerSettlementBatch b = s.getBatch();
        b.setStatus(CarOwnerSettlementBatch.Status.APPROVED);
        if (memo != null && memo.getMemo() != null) s.setMemo(memo.getMemo());
        return toDetail(s);
    }

    /** 지급 */
    @Transactional
    @Override
    public SettlementDetailResponse pay(String ownerId, Long id, SettlementPayRequest req) {
    	CarOwnerSettlement s = itemRepo.findOneForOwner(id, ownerId);
        if (s == null) throw new IllegalArgumentException("SETTLEMENT_NOT_FOUND");
        CarOwnerSettlementBatch b = s.getBatch();
        b.setStatus(CarOwnerSettlementBatch.Status.PAID);
        b.setPaidAt(LocalDateTime.now(KST));
        if (req != null && req.getTxRef() != null) s.setTxRef(req.getTxRef());
        return toDetail(s);
    }

    /** 취소 */
    @Transactional
    @Override
    public SettlementDetailResponse cancel(String ownerId, Long id, SettlementMemoRequest memo) {
        CarOwnerSettlement s = itemRepo.findOneForOwner(id, ownerId);
        if (s == null) throw new IllegalArgumentException("SETTLEMENT_NOT_FOUND");
        CarOwnerSettlementBatch b = s.getBatch();
        b.setStatus(CarOwnerSettlementBatch.Status.CANCELED);
        if (memo != null && memo.getMemo() != null) s.setMemo(memo.getMemo());
        return toDetail(s);
    }

    /** 요약 카드 */
    @Transactional(readOnly = true)
    @Override
    public SettlementSummaryCardResponse summary(String ownerId) {
        LocalDate today = LocalDate.now(KST);
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end   = today.plusDays(1).atStartOfDay();

        long todayEarnings = batchRepo.sumPaidBetween(ownerId, start, end);
        LocalDate month = today.withDayOfMonth(1);
        long monthEarnings = batchRepo.sumForMonth(ownerId, month, month.plusMonths(1));
        long unsettled = batchRepo.sumUnsettled(ownerId);

        return SettlementSummaryCardResponse.builder()
                .todayEarnings(todayEarnings)
                .monthEarnings(monthEarnings)
                .unsettledAmount(unsettled)
                .month(month)
                .build();
    }

    private static Long tryParseLong(String s) {
        try { return s == null ? null : Long.parseLong(s); }
        catch (NumberFormatException e) { return null; }
    }
}