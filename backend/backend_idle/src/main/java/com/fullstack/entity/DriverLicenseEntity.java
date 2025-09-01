package com.fullstack.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
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
@Table(name = "DRIVER_LICENSE")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverLicenseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "LICENSE_NUMBER", nullable = false)
    private String licenseNumber;

    @Column(name = "NAME_ON_LICENSE")
    private String nameOnLicense;

    @Column(name = "ISSUE_DATE")
    private LocalDate issueDate;

    @Column(name = "VERIFIED")
    private Boolean verified;

    @Column(name = "VERIFIED_AT")
    private LocalDateTime verifiedAt;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "transport_auth_id", unique = true, nullable = false)
    private CarOwnerAuthEntity transportAuth;
}