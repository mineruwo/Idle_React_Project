package com.fullstack.service;

import com.fullstack.entity.CustomerEntity;
import com.fullstack.entity.ReviewEntity;
import com.fullstack.model.ReviewRequestDTO;
import com.fullstack.model.ReviewResponseDTO;
import com.fullstack.repository.CustomerRepository;
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

    @Override
    public ReviewResponseDTO createReview(ReviewRequestDTO requestDto, String authorEmail) {
        // 작성자(화주) 정보 조회
        CustomerEntity author = customerRepository.findById(authorEmail)
                .orElseThrow(() -> new IllegalArgumentException("작성자 정보를 찾을 수 없습니다."));

        // 대상(차주) 정보 조회
        CustomerEntity target = customerRepository.findById(requestDto.getTargetId())
                .orElseThrow(() -> new IllegalArgumentException("리뷰 대상 정보를 찾을 수 없습니다."));

        // TODO: 비즈니스 로직 추가
        // 1. 화주가 해당 차주와의 거래를 완료했는지 확인 (orderId 기반)
        // 2. 해당 거래에 대해 이미 리뷰를 작성했는지 확인

        ReviewEntity reviewEntity = ReviewEntity.builder()
                .author(author)
                .target(target)
                .rating(requestDto.getRating())
                .content(requestDto.getContent())
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

