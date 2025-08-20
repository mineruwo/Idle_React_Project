package com.fullstack.service;

import com.fullstack.model.ReviewRequestDTO;
import com.fullstack.model.ReviewResponseDTO;

import java.util.List;

public interface ReviewService {

    
    ReviewResponseDTO createReview(ReviewRequestDTO requestDto, String authorEmail);

    List<ReviewResponseDTO> getReviewsByTarget(Integer targetId);

    void deleteReview(Long reviewId, String authorEmail);
}
