package com.fullstack.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewRequestDTO {
    private Long targetId; // 리뷰 대상(차주)의 ID
    private Long orderId; // 어떤 주문에 대한 리뷰인지
    private Integer rating;
    private String content;
}
