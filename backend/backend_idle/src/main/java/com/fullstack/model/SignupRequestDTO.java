package com.fullstack.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignupRequestDTO {

    private String id;
    private String passwordEnc;
    private String customName;
    private String role;
    private String phone;
    private String nickname;

}