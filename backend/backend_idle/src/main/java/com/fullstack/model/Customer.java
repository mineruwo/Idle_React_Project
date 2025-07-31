package com.fullstack.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "CUSTOMER")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // PostgreSQL의 SERIAL에 매핑
    @Column(name = "ID_NUM")
    private Integer idNum;

    @Column(name = "ID", nullable = false)
    private String id;

    @Column(name = "PASSWORD_ENC", nullable = false)
    private String passwordEnc;

    @Column(name = "CUSTOM_NAME")
    private String customName;

    @Column(name = "ROLE")
    private String role;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    @Column(name = "PHONE", nullable = false)
    private String phone;

    @Column(name = "NICKNAME", nullable = false)
    private String nickname;

    @Column(name = "SNS_LOGIN_PROVIDER")
    private String snsLoginProvider;

    @Column(name = "SNS_PROVIDER_ID")
    private String snsProviderId;

    @Column(name = "LEFTED_AT")
    private LocalDateTime leftedAt;

    @Column(name = "IS_LEFTED", nullable = false)
    private Boolean isLefted;

    @Column(name = "USER_POINT", nullable = false)
    private Integer userPoint;

}
