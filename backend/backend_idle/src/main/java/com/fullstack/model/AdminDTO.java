package com.fullstack.model;


import java.time.LocalDateTime;

import com.fullstack.model.enums.AdminRole;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDTO {

    private Integer idIndex;
    private String adminId;
    private AdminRole role;
    private String password;
    private String name;
    private String emplId;
    private LocalDateTime regDate;
    private LocalDateTime delDate;
    @Builder.Default
    private boolean isDel = false;
}
