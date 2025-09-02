package com.fullstack.service;

import com.fullstack.entity.CustomerEntity;
import com.fullstack.entity.OrderEntity;
import com.fullstack.model.CarOwnerDashboardDTO.DashboardSummaryDTO;
import com.fullstack.model.CarOwnerDashboardDTO.DeliveryItemDTO;
import com.fullstack.model.CarOwnerDashboardDTO.SalesChartDTO;
import com.fullstack.model.CarOwnerDashboardDTO.WarmthDTO;
import com.fullstack.model.enums.OrderStatus; // Added import
import com.fullstack.repository.CarOwnerDashboardPaymentRepository;
import com.fullstack.repository.CustomerRepository;
import com.fullstack.repository.OrderRepository; // ✅ 새로 주입
import com.fullstack.repository.ReviewRepository;
import com.fullstack.repository.CustomerRepository; // Added

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RequiredArgsConstructor
@Log4j2
@Service
public class CarOwnerDashboardServiceImpl implements CarOwnerDashboardService {

	private final OrderRepository orderRepository;
	private final CustomerRepository customerRepository;
	private final ReviewRepository reviewRepository;

	private static final DateTimeFormatter DF = DateTimeFormatter.ofPattern("yyyy-MM-dd");
	private static final int DEFAULT_COMMISSION_RATE = 10; // %

	private Long resolveDriverKey(String ownerId) {
		return customerRepository.findByLoginId(ownerId)
				.map(c -> c.getIdNum() == null ? null : c.getIdNum().longValue()).orElse(null);
	}

	@Transactional(readOnly = true)
	@Override
	public DashboardSummaryDTO getSummary(String ownerId, String period) {
		Long driverKey = resolveDriverKey(ownerId);

		DateRange dr = resolveRange(period);
		LocalDateTime start = dr.startDate.atStartOfDay();
		LocalDateTime end = dr.endDate.atTime(LocalTime.MAX);

		CustomerEntity assignedDriver = driverKey == null ? null : customerRepository.findByIdNum(driverKey).orElse(null);

		long completed = assignedDriver == null ? 0
				: orderRepository.countByAssignedDriverAndStatus(assignedDriver, OrderStatus.COMPLETED);
		long inProgress = assignedDriver == null ? 0
				: orderRepository.countByAssignedDriverAndStatus(assignedDriver, OrderStatus.ONGOING);
		long scheduled = assignedDriver == null ? 0
				: orderRepository.countByAssignedDriverAndStatus(assignedDriver, OrderStatus.READY);
		long total = completed + inProgress + scheduled;

		// ✅ 이번달 매출: Order 기준(완료건의 driverPrice/proposedPrice 합)
		long revenue = (driverKey == null) ? 0L
				: Optional.ofNullable(orderRepository.sumRevenueByDriverBetween(driverKey, start, end)).orElse(0L);

		int commissionRate = DEFAULT_COMMISSION_RATE;
		long settlement = Math.round(revenue * (100 - commissionRate) / 100.0);

		String displayName = customerRepository.findNicknameByOwnerId(ownerId).orElse(ownerId);

		return DashboardSummaryDTO.builder().name(displayName).nickname(displayName).completed((int) completed)
				.inProgress((int) inProgress).scheduled((int) scheduled).total((int) total).revenue(revenue) // ✅ 이제
																												// Order
																												// 기반
																												// 금액이
																												// 채워짐
				.commission(commissionRate).settlement(settlement).build();
	}

	@Transactional(readOnly = true)
	@Override
	public List<SalesChartDTO> getSalesChart(String ownerId) {
	    Long driverKey = resolveDriverKey(ownerId);

	    LocalDate today = LocalDate.now();
	    LocalDate first = today.withDayOfMonth(1);
	    LocalDate last  = today.withDayOfMonth(today.lengthOfMonth());
	    LocalDateTime start = first.atStartOfDay();
	    LocalDateTime end   = last.atTime(LocalTime.MAX);

	    // 매출 맵 (완료건 합계)
	    Map<String, Long> salesMap = new LinkedHashMap<>();
	    // 운송건수 맵 (완료건 건수)
	    Map<String, Long> deliveriesMap = new LinkedHashMap<>();

	    if (driverKey != null) {
	        orderRepository.sumDailyRevenueByDriverBetween(driverKey, start, end)
	                .forEach(row -> {
	                    String day = (String) row[0];
	                    Long sum   = (Long)   row[1];
	                    salesMap.put(day, sum == null ? 0L : sum);
	                });

	        orderRepository.countDailyCompletedByDriverBetween(driverKey, start, end)
	                .forEach(row -> {
	                    String day = (String) row[0];
	                    Long cnt   = (Long)   row[1];
	                    deliveriesMap.put(day, cnt == null ? 0L : cnt);
	                });
	    }

	    List<SalesChartDTO> out = new ArrayList<>();
	    DateTimeFormatter DF = DateTimeFormatter.ofPattern("yyyy-MM-dd");
	    for (LocalDate d = first; !d.isAfter(last); d = d.plusDays(1)) {
	        String key = d.format(DF);
	        out.add(SalesChartDTO.builder()
	                .day(key)
	                .sales(salesMap.getOrDefault(key, 0L))
	                .deliveries(deliveriesMap.getOrDefault(key, 0L)) // ✅ 여기!
	                .build());
	    }
	    return out;
	}
	@Transactional(readOnly = true)
	@Override
	public WarmthDTO getWarmth(String ownerId) {
	    // ownerId(loginId) -> 드라이버 idNum
	    CustomerEntity me = customerRepository.findByLoginId(ownerId)
	            .orElseThrow(() -> new AccessDeniedException("AUTH_USER_NOT_FOUND"));
	    Integer driverIdNum = me.getIdNum();

	    long cnt = reviewRepository.countByTargetIdNum(driverIdNum);

	    if (cnt == 0) {
	        // 리뷰 없음 → 점수 미표기
	        return new WarmthDTO(null, 0, null);
	    }

	    Double avg = reviewRepository.avgRatingByTargetIdNum(driverIdNum); // 1~5
	    if (avg == null) {
	        return new WarmthDTO(null, 0, null);
	    }

	    // 5점 만점 → 100점 환산
	    int score = (int)Math.round((avg / 5.0) * 100.0);

	    return new WarmthDTO(score, (int)cnt, avg);
	}

	@Transactional(readOnly = true)
	@Override
	public List<DeliveryItemDTO> getDeliveries(String ownerId) {
		Long driverKey = resolveDriverKey(ownerId);
		if (driverKey == null)
			return List.of();

		CustomerEntity assignedDriver = customerRepository.findByIdNum(driverKey)
				.orElseThrow(() -> new AccessDeniedException("Driver not found"));

		List<String> statuses = List.of("READY", "ONGOING");

		return orderRepository
				.findTop5ByAssignedDriverAndStatusInOrderByUpdatedAtDesc(assignedDriver, OrderStatus.READY,
						OrderStatus.ONGOING) // ✅ varargs
				.stream()
				.map(o -> DeliveryItemDTO.builder().id(o.getId()).deliveryNum(String.valueOf(o.getId()))
						.status(o.getStatus().name()).transport_type(o.getCargoType()).from(o.getDeparture())
						.s_date(o.getUpdatedAt() == null ? null : o.getUpdatedAt().toLocalDate().toString())
						.to(o.getArrival()).build())
				.toList();
	}

	private static class DateRange {
		final LocalDate startDate;
		final LocalDate endDate;

		DateRange(LocalDate s, LocalDate e) {
			this.startDate = s;
			this.endDate = e;
		}
	}

	private DateRange resolveRange(String period) {
		LocalDate today = LocalDate.now();
		switch ((period == null ? "month" : period).toLowerCase()) {
		case "week": // 이번 주 (월~일)
			LocalDate monday = today.with(java.time.DayOfWeek.MONDAY);
			LocalDate sunday = monday.plusDays(6);
			return new DateRange(monday, sunday);

		case "last7": // 최근 7일 (오늘 포함)
			return new DateRange(today.minusDays(6), today);

		case "last30": // 최근 30일
			return new DateRange(today.minusDays(29), today);

		case "month":
		default: // 이번 달 (1일~말일)
			LocalDate first = today.withDayOfMonth(1);
			LocalDate last = today.withDayOfMonth(today.lengthOfMonth());
			return new DateRange(first, last);
		}
	}
	
	@Transactional
	public void markDeparted(String ownerId, Long orderId) {
	    Long driverKey = resolveDriverKey(ownerId);
	    if (driverKey == null) throw new AccessDeniedException("AUTH_USER_NOT_FOUND");

	   
	    CustomerEntity assignedDriver = customerRepository.findByIdNum(driverKey)
	            .orElseThrow(() -> new AccessDeniedException("Driver not found"));
	   
	    LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));

	    int updated = orderRepository.markDeparted(orderId, assignedDriver.getIdNum().longValue(), now);
	    if (updated == 0) {
	      
	        throw new IllegalStateException("TRANSITION_NOT_ALLOWED: READY->ONGOING");
	    }
	}

	@Transactional
	public void markCompleted(String ownerId, Long orderId) {
	    Long driverKey = resolveDriverKey(ownerId);
	    if (driverKey == null) throw new AccessDeniedException("AUTH_USER_NOT_FOUND");

	    CustomerEntity assignedDriver = customerRepository.findByIdNum(driverKey)
	            .orElseThrow(() -> new AccessDeniedException("Driver not found"));

	    LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));

	    int updated = orderRepository.markCompleted(orderId, assignedDriver.getIdNum().longValue(), now);
	    if (updated == 0) {
	        throw new IllegalStateException("TRANSITION_NOT_ALLOWED: ONGOING->COMPLETED");
	    }
	}
	@Transactional
    public void cancel(String ownerId, Long orderId) {
        Long driverKey = resolveDriverKey(ownerId);
        if (driverKey == null) throw new AccessDeniedException("AUTH_USER_NOT_FOUND");

        	    CustomerEntity assignedDriver = customerRepository.findByIdNum(driverKey)
	            .orElseThrow(() -> new AccessDeniedException("Driver not found"));

	            int updated = orderRepository.markCanceled(orderId, assignedDriver.getIdNum().longValue(), LocalDateTime.now(ZoneId.of("Asia/Seoul")));
        if (updated == 0) throw new IllegalStateException("TRANSITION_NOT_ALLOWED: READY/ONGOING->CANCELED");
    }
}