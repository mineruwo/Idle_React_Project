package com.fullstack.model;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CustomerDTO {

    private String id;
    private String passwordEnc;
    private String customName;
    private String role;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String phone;
    private String nickname;
    private String snsLoginProvider;
    private String snsProviderId;
    private LocalDateTime leftedAt;
    private Boolean isLefted;
    private Integer userPoint;

}
