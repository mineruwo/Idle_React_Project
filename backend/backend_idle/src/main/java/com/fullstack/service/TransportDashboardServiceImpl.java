package com.fullstack.service;

import org.springframework.stereotype.Service;

import com.fullstack.entity.TransportAuth;
import com.fullstack.model.TransportSummaryDTO;
import com.fullstack.repository.CustomerRepository;
import com.fullstack.repository.OrderRepository;
import com.fullstack.repository.PaymentRepository;
import com.fullstack.repository.TransportAuthRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TransportDashboardServiceImpl implements TransportDashboardService {

	private final OrderRepository orderRepository;
	private final PaymentRepository paymentRepository;
	private final CustomerRepository customerRepository;
	private final TransportAuthRepository transportAuthRepository;

	@Override
	public TransportSummaryDTO getTransportSummary(String nickname) {

	    // nickname → customerId (CustomerEntity의 PK)
	    Integer customerId = customerRepository.findIdNumByNickname(nickname);

	    // customerId → carNum (TransportAuth의 PK)
	    TransportAuth auth = transportAuthRepository.findByCustomerId(customerId)
	        .orElseThrow(() -> new RuntimeException("해당 고객의 차량 정보가 없습니다."));

	    String carNum = auth.getCarNum();

	    // 상태별 운송건수 조회
	    int completed = orderRepository.countByCarNumAndStatus(carNum, "DELIVERED");
	    int inProgress = orderRepository.countByCarNumAndStatus(carNum, "SHIPPED");
	    int scheduled = orderRepository.countByCarNumAndStatus(carNum, "READY");
	    int total = completed + inProgress + scheduled;

	    // 매출 및 정산 계산
	    long revenue = paymentRepository.getRevenueThisMonth(carNum);
	    int commissionRate = 10;
	    long settlement = revenue * (100 - commissionRate) / 100;

	    // 닉네임 그대로 반환
	    return TransportSummaryDTO.builder()
	        .name(nickname)
	        .completed(completed)
	        .inProgress(inProgress)
	        .scheduled(scheduled)
	        .total(total)
	        .revenue(revenue)
	        .commission(commissionRate)
	        .settlement(settlement)
	        .build();
	}
}
