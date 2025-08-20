package com.fullstack.controller;

import com.fullstack.model.ReviewRequestDTO;
import com.fullstack.model.ReviewResponseDTO;
import com.fullstack.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // 리뷰 생성
    @PostMapping
    public ResponseEntity<ReviewResponseDTO> createReview(
            @RequestBody ReviewRequestDTO requestDto,
            @AuthenticationPrincipal String authorEmail) { // Spring Security를 통해 인증된 사용자 이메일 주입
        
        ReviewResponseDTO response = reviewService.createReview(requestDto, authorEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 특정 대상(차주)의 리뷰 목록 조회
    @GetMapping("/target/{targetId}")
    public ResponseEntity<List<ReviewResponseDTO>> getReviewsByTarget(@PathVariable("targetId") Integer targetId) {
        List<ReviewResponseDTO> reviews = reviewService.getReviewsByTarget(targetId);
        return ResponseEntity.ok(reviews);
    }

    // 내가 작성한 리뷰 목록 조회
    @GetMapping("/my-reviews")
    public ResponseEntity<List<ReviewResponseDTO>> getMyReviews(@AuthenticationPrincipal String authorEmail) {
        List<ReviewResponseDTO> reviews = reviewService.getReviewsByAuthor(authorEmail);
        return ResponseEntity.ok(reviews);
    }

    // 리뷰 삭제
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable("reviewId") Long reviewId,
            @AuthenticationPrincipal String authorEmail) {
        
        reviewService.deleteReview(reviewId, authorEmail);
        return ResponseEntity.noContent().build();
    }
}

