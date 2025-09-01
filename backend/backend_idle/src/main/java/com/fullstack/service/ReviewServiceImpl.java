package com.fullstack.service;

import com.fullstack.entity.CustomerEntity;
import com.fullstack.entity.Order;
import com.fullstack.entity.ReviewEntity;
import com.fullstack.model.ReviewRequestDTO;
import com.fullstack.model.ReviewResponseDTO;
import com.fullstack.repository.CustomerRepository;
import com.fullstack.repository.OrderRepository;
import com.fullstack.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Log4j2
@RequiredArgsConstructor
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    

    @Override
    public ReviewResponseDTO createReview(ReviewRequestDTO requestDto, String authorEmail) {
        // 작성자(화주) 정보 조회
        CustomerEntity author = customerRepository.findById(authorEmail)
                .orElseThrow(() -> new IllegalArgumentException("작성자 정보를 찾을 수 없습니다."));

        // 대상(차주) 정보 조회
        CustomerEntity target = customerRepository.findById(requestDto.getTargetId().intValue())
                .orElseThrow(() -> new IllegalArgumentException("리뷰 대상 정보를 찾을 수 없습니다."));

        // TODO: 비즈니스 로직 추가
        // 1. 화주가 해당 차주와의 거래를 완료했는지 확인 (orderId 기반)
        // 2. 해당 거래에 대해 이미 리뷰를 작성했는지 확인
        Order orderEntity = orderRepository.findById(requestDto.getOrderId())
        		.orElseThrow(() -> new IllegalArgumentException("주문 정보를 찾을 수 없습니다."));

        ReviewEntity reviewEntity = ReviewEntity.builder()
                .author(author)
                .target(target)
                .rating(requestDto.getRating())
                .content(requestDto.getContent())
                .order(orderEntity)
                .build();

        reviewRepository.save(reviewEntity);
        log.info("Review created: {}", reviewEntity.getId());

        return ReviewResponseDTO.fromEntity(reviewEntity);
    }

        @Override
    @Transactional(readOnly = true)
    public List<ReviewResponseDTO> getReviewsByTarget(Integer targetId) {
        List<ReviewEntity> reviews = reviewRepository.findByTarget_IdNum(targetId);
        return reviews.stream()
                .map(ReviewResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponseDTO> getReviewsByAuthor(String authorEmail) {
        // 1. 로그인 정보 확인
        if (authorEmail == null) {
            throw new AccessDeniedException("로그인이 필요한 서비스입니다.");
        }
        // 2. 이메일로 작성자 정보 조회
        CustomerEntity author = customerRepository.findById(authorEmail)
                .orElseThrow(() -> new IllegalArgumentException("작성자 정보를 찾을 수 없습니다: " + authorEmail));

        // 3. 작성자의 idNum 값 확인 (디버깅용 방어 코드)
        Integer authorIdNum = author.getIdNum();
        if (authorIdNum == null) {
            throw new IllegalArgumentException("오류: 사용자 정보에 idNum이 설정되어 있지 않습니다.");
        }

        // 4. idNum으로 리뷰 목록 조회
        List<ReviewEntity> reviews = reviewRepository.findByAuthor_IdNum(authorIdNum);

        // 5. DTO로 변환하여 반환
        return reviews.stream()
                .map(ReviewResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteReview(Long reviewId, String authorEmail) {
        ReviewEntity review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));

        // 리뷰 작성자 본인인지 확인
        if (!review.getAuthor().getId().equals(authorEmail)) {
            throw new AccessDeniedException("리뷰를 삭제할 권한이 없습니다.");
        }

        reviewRepository.delete(review);
        log.info("Review deleted: {}", reviewId);
    }
}

