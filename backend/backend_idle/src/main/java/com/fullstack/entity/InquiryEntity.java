package com.fullstack.entity;

import com.fullstack.model.InquiryStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.ManyToOne; // Added
import jakarta.persistence.JoinColumn; // Added
import jakarta.persistence.FetchType; // Added

import java.time.LocalDateTime;
import java.util.UUID;


@Entity
@Table(name = "inquiry")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InquiryEntity {

        @Id
    @GeneratedValue(generator = "uuid2")
    @Column(name = "inquiry_id")
    private UUID inquiryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id_num", referencedColumnName = "ID_NUM", nullable = false)
    private CustomerEntity customer;

    @Column(name = "inquiry_title", nullable = false, length = 255)
    private String inquiryTitle;

    @Column(name = "inquiry_content", nullable = false, columnDefinition = "TEXT")
    private String inquiryContent;

    @Column(name = "inquiry_answer", columnDefinition = "TEXT")
    private String inquiryAnswer;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "answered_at")
    private LocalDateTime answeredAt;

    

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", referencedColumnName = "ADMIN_ID")
    private AdminEntity admin;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private InquiryStatus status;

    @Column(name = "re_inquiry_id")
    private UUID reInquiryId;

    @PrePersist
    protected void onCreate() {
        if (inquiryId == null) {
            inquiryId = UUID.randomUUID();
        }
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = InquiryStatus.INQUIRY_PENDING;
        }
    }
}
