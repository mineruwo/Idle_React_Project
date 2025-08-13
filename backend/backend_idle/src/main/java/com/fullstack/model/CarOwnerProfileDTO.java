package com.fullstack.model;



import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CarOwnerProfileDTO {

    private Long id;              // 프로필 PK
    private String ownerId;       // JWT principal
    private String customName;    // 이름
    private String nickname;      // 닉네임
    private String phone;         // 연락처
    private String avatarUrl;     // 프로필 이미지 URL
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}