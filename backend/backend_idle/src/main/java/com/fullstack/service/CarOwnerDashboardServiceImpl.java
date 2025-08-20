package com.fullstack.service;

import com.fullstack.entity.Order;
import com.fullstack.model.CarOwnerDashboardDTO.DashboardSummaryDTO;
import com.fullstack.model.CarOwnerDashboardDTO.DeliveryItemDTO;
import com.fullstack.model.CarOwnerDashboardDTO.SalesChartDTO;
import com.fullstack.model.CarOwnerDashboardDTO.WarmthDTO;
import com.fullstack.repository.CarOwnerDashboardPaymentRepository;
import com.fullstack.repository.CustomerRepository;
import com.fullstack.repository.OrderRepository;   // ✅ 새로 주입
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Log4j2
public class CarOwnerDashboardServiceImpl implements CarOwnerDashboardService {

    private final OrderRepository orderRepository;                         // ✅ 변경
    private final CarOwnerDashboardPaymentRepository paymentRepo;          // 매출은 기존 그대로 (customer.id 기준)
    private final CustomerRepository customerRepository;

    private static final DateTimeFormatter DF = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final int DEFAULT_COMMISSION_RATE = 10; // %

    /** 로그인 이메일 -> 기사키(assignedDriverId로 쓰일 idNum Long) */
    private Long resolveDriverKey(String ownerId) {
        return customerRepository.findByLoginId(ownerId)
                .map(c -> c.getIdNum() == null ? null : c.getIdNum().longValue())
                .orElse(null);
    }

    @Transactional(readOnly = true)
    @Override
    public DashboardSummaryDTO getSummary(String ownerId) {
        Long driverKey = resolveDriverKey(ownerId);
        log.info("[DASH] ownerId={}, driverKey={}", ownerId, driverKey);
        long completed  = driverKey == null ? 0 : orderRepository.countByAssignedDriverIdAndStatus(driverKey, "COMPLETED");
        long inProgress = driverKey == null ? 0 : orderRepository.countByAssignedDriverIdAndStatus(driverKey, "ONGOING");
        long scheduled  = driverKey == null ? 0 : orderRepository.countByAssignedDriverIdAndStatus(driverKey, "CREATED");
        long total      = completed + inProgress + scheduled;

        // 닉네임 표시
        String displayName = customerRepository.findNicknameByOwnerId(ownerId).orElse(ownerId);

        // 매출(결제)은 기존처럼 ownerId(=customer.id, 이메일) 기준
        LocalDate today = LocalDate.now();
        LocalDateTime start = today.withDayOfMonth(1).atStartOfDay();
        LocalDateTime end   = today.withDayOfMonth(today.lengthOfMonth()).atTime(LocalTime.MAX);
        long revenue = Optional.ofNullable(paymentRepo.sumMonthlyRevenue(ownerId, start, end)).orElse(0L);
        int commissionRate = DEFAULT_COMMISSION_RATE;
        long settlement = Math.round(revenue * (100 - commissionRate) / 100.0);

        return DashboardSummaryDTO.builder()
                .name(displayName)
                .nickname(displayName)
                .completed((int) completed)
                .inProgress((int) inProgress)
                .scheduled((int) scheduled)
                .total((int) total)
                .revenue(revenue)
                .commission(commissionRate)
                .settlement(settlement)
                .build();
    }

    @Transactional(readOnly = true)
    @Override
    public List<SalesChartDTO> getSalesChart(String ownerId) {
        // 매출 라인은 기존 결제기반 그대로 사용 (필요 시 Order기반 운송건수로 보강 가능)
        LocalDate today = LocalDate.now();
        LocalDate first = today.withDayOfMonth(1);
        LocalDate last  = today.withDayOfMonth(today.lengthOfMonth());
        LocalDateTime start = first.atStartOfDay();
        LocalDateTime end   = last.atTime(LocalTime.MAX);

        Map<String, Long> salesMap = new LinkedHashMap<>();
        paymentRepo.sumDailyRevenue(ownerId, start, end).forEach(row -> {
            String day = (String) row[0];
            Long sum   = (Long)   row[1];
            salesMap.put(day, sum == null ? 0L : sum);
        });

        // 운송건수는 간단히 0으로 채우거나, Order 기반 일집계 쿼리 추가해서 채우세요.
        List<SalesChartDTO> out = new ArrayList<>();
        LocalDate d = first;
        while (!d.isAfter(last)) {
            String key = DF.format(d);
            out.add(SalesChartDTO.builder()
                    .day(key)
                    .sales(salesMap.getOrDefault(key, 0L))
                    .deliveries(0) // 필요시 OrderRepository에 daily count 쿼리 추가하여 채우기
                    .build());
            d = d.plusDays(1);
        }
        return out;
    }

    @Transactional(readOnly = true)
    @Override
    public WarmthDTO getWarmth(String ownerId) {
        Long driverKey = resolveDriverKey(ownerId);
        int completed = (int) (driverKey == null ? 0 :
                orderRepository.countByAssignedDriverIdAndStatus(driverKey, "COMPLETED"));
        int late = 0; // 실제 예정/도착 시간이 생기면 로직 교체
        return new WarmthDTO(completed, late);
    }

    @Transactional(readOnly = true)
    @Override
    public List<DeliveryItemDTO> getDeliveries(String ownerId) {
        Long driverKey = resolveDriverKey(ownerId);
        if (driverKey == null) return List.of();

        return orderRepository
                .findTop5ByAssignedDriverIdAndStatusOrderByUpdatedAtDesc(driverKey, "ONGOING")
                .stream()
                .map(o -> DeliveryItemDTO.builder()
                        .id(o.getId())
                        .deliveryNum(String.valueOf(o.getId()))
                        .status(o.getStatus())
                        .transport_type(o.getCargoType())
                        .from(o.getDeparture())
                        .s_date(o.getUpdatedAt() == null ? null : o.getUpdatedAt().toLocalDate().toString())
                        .to(o.getArrival())
                        .build())
                .toList();
    }
}
