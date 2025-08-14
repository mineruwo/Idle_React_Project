package com.fullstack.service;


import com.fullstack.entity.CarOwnerOrderList;
import com.fullstack.model.CarOwnerDashboardDTO.DashboardSummaryDTO;
import com.fullstack.model.CarOwnerDashboardDTO.DeliveryItemDTO;
import com.fullstack.model.CarOwnerDashboardDTO.SalesChartDTO;
import com.fullstack.model.CarOwnerDashboardDTO.WarmthDTO;
import com.fullstack.repository.CarOwnerDashboardPaymentRepository;
import com.fullstack.repository.CarOwnerOrderListRepository;
import com.fullstack.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

import static com.fullstack.entity.CarOwnerOrderList.Status.*;

@Service
@RequiredArgsConstructor
public class CarOwnerDashboardServiceImpl implements CarOwnerDashboardService {

	 private final CarOwnerOrderListRepository orderRepo;
	    private final CarOwnerDashboardPaymentRepository paymentRepo;

	    private static final DateTimeFormatter DF = DateTimeFormatter.ofPattern("yyyy-MM-dd");
	    private static final int DEFAULT_COMMISSION_RATE = 10; // %

	    @Override
	    public DashboardSummaryDTO getSummary(String ownerId) {
	        int completed  = (int) orderRepo.countByOwnerIdAndStatus(ownerId, COMPLETED);
	        int inProgress = (int) orderRepo.countByOwnerIdAndStatus(ownerId, ONGOING);
	        int scheduled  = (int) orderRepo.countByOwnerIdAndStatus(ownerId, CREATED);
	        int total      = completed + inProgress + scheduled;

	        LocalDate today = LocalDate.now();
	        LocalDateTime start = today.withDayOfMonth(1).atStartOfDay();
	        LocalDateTime end   = today.withDayOfMonth(today.lengthOfMonth()).atTime(LocalTime.MAX);

	        long revenue = Optional.ofNullable(paymentRepo.sumMonthlyRevenue(ownerId, start, end)).orElse(0L);
	        int commissionRate = DEFAULT_COMMISSION_RATE;
	        long settlement = Math.round(revenue * (100 - commissionRate) / 100.0);

	        return DashboardSummaryDTO.builder()
	                .name(ownerId) // TODO: 닉네임으로 바꾸려면 프로필 연동
	                .completed(completed)
	                .inProgress(inProgress)
	                .scheduled(scheduled)
	                .total(total)
	                .revenue(revenue)
	                .commission(commissionRate)
	                .settlement(settlement)
	                .build();
	    }

	    @Override
	    public List<SalesChartDTO> getSalesChart(String ownerId) {
	        LocalDate today = LocalDate.now();
	        LocalDate first = today.withDayOfMonth(1);
	        LocalDate last  = today.withDayOfMonth(today.lengthOfMonth());
	        LocalDateTime start = first.atStartOfDay();
	        LocalDateTime end   = last.atTime(LocalTime.MAX);

	        // 일자별 매출
	        Map<String, Long> salesMap = new LinkedHashMap<>();
	        paymentRepo.sumDailyRevenue(ownerId, start, end).forEach(row -> {
	            String day = (String) row[0];
	            Long sum   = (Long)   row[1];
	            salesMap.put(day, sum == null ? 0L : sum);
	        });

	        // 일자별 운송건수 (updatedAt 기준)
	        Map<String, Integer> deliMap = new LinkedHashMap<>();
	        orderRepo.countDailyDeliveries(ownerId, start, end).forEach(row -> {
	            String day = (String) row[0];
	            Long cnt   = (Long)   row[1];
	            deliMap.put(day, cnt == null ? 0 : cnt.intValue());
	        });

	        // 모든 날짜를 0으로 채워 일자 라인차트 안정화
	        List<SalesChartDTO> out = new ArrayList<>();
	        LocalDate d = first;
	        while (!d.isAfter(last)) {
	            String key = DF.format(d);
	            out.add(SalesChartDTO.builder()
	                    .day(key)
	                    .sales(salesMap.getOrDefault(key, 0L))
	                    .deliveries(deliMap.getOrDefault(key, 0))
	                    .build());
	            d = d.plusDays(1);
	        }
	        return out;
	    }

	    @Override
	    public WarmthDTO getWarmth(String ownerId) {
	        // 시각 정보가 없으므로 '지각' 판별 불가 → 임시 규칙: 완료=정시, 지각=0
	        int completed = (int) orderRepo.countByOwnerIdAndStatus(ownerId, COMPLETED);
	        int late = 0; // TODO: 실제 예정/도착 시각 컬럼 생기면 로직 교체
	        return new WarmthDTO(completed, late);
	    }

	    @Override
	    public List<DeliveryItemDTO> getDeliveries(String ownerId) {
	        // 진행중 최근 5건만 - 날짜는 일자 문자열만 사용
	        List<CarOwnerOrderList> list =
	                orderRepo.findByOwnerIdAndStatusOrderByUpdatedAtDesc(ownerId, ONGOING)
	                         .stream().limit(5).collect(Collectors.toList());

	        return list.stream().map(o -> DeliveryItemDTO.builder()
	                .deliveryNum(String.valueOf(o.getId()))
	                .status(toKoreanStatus(o.getStatus()))
	                .transport_type(o.getCargoType())
	                .from(o.getDeparture())
	                .s_date(formatDateOnly(o.getUpdatedAt())) // 출발 예정일(대체): updatedAt의 '일자'
	                .to(o.getArrival())
	                .date(formatDateOnly(o.getUpdatedAt()))   // 도착 예정일(대체): 일자만 표시
	                .build()
	        ).collect(Collectors.toList());
	    }

	    private String toKoreanStatus(CarOwnerOrderList.Status s) {
	        if (s == null) return "알수없음";
	        switch (s) {
	            case CREATED:   return "예정";
	            case ONGOING:   return "배송중";
	            case COMPLETED: return "완료";
	            case CANCELED:  return "취소";
	            default:        return s.name();
	        }
	    }

	    private String formatDateOnly(LocalDateTime dt) {
	        if (dt == null) return null;
	        return dt.toLocalDate().format(DF);
	    }
}
