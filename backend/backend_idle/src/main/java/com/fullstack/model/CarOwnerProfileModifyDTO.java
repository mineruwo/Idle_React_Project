package com.fullstack.model;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CarOwnerProfileModifyDTO {
    @Size(max = 30, message="이름은 30자 이하여야 합니다")
    private String customName;

    @Size(max = 20, message="닉네임은 20자 이하여야 합니다")
    private String nickname;

    @Pattern(
      regexp = "^(01[0-9])-?\\d{3,4}-?\\d{4}$",
      message = "휴대전화 형식이 올바르지 않습니다"
    )
    private String phone;

    private String avatarUrl; // 아직 CustomerEntity에 없으면 무시/보류
}