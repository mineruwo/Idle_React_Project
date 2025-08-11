package com.fullstack.model;

import lombok.Data;

@Data
public class PointUsageRequestDto {
    private Integer userId; // 사용자 식별자 (CustomerEntity의 idNum 필드)
    private int points;    // 사용할 포인트
}
