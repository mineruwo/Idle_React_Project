package com.fullstack.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "BUSINESS_LICENSE")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessLicense {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "BUSINESS_NUMBER", nullable = false)
    private String businessNumber;

    @Column(name = "BUSINESS_NAME")
    private String businessName;

    @Column(name = "START_DATE")
    private LocalDateTime startDate;

    @Column(name = "VERIFIED")
    private Boolean verified;

    @Column(name = "VERIFIED_AT")
    private LocalDateTime verifiedAt;

    @OneToOne
    @JoinColumn(name = "transport_auth_id", nullable = false)
    private TransportAuth transportAuth;
}